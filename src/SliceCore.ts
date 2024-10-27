import { ponder } from "@/generated"
import { zeroAddress } from "viem"
import { baseFee } from "./utils/constants"
import { reducePayees } from "./utils/reducePayees"

ponder.on("SliceCore:TokenSliced", async ({ event, context: { db } }) => {
  const {
    slicerAddress,
    tokenId,
    params: {
      payees,
      minimumShares,
      currencies,
      releaseTimelock,
      transferTimelock,
      controller,
      slicerFlags,
      sliceCoreFlags
    },
    slicerVersion
  } = event.args
  const creator = event.transaction.from

  const creatorPayee = {
    account: creator,
    shares: 0,
    transfersAllowedWhileLocked: false
  }
  const allPayees = reducePayees([creatorPayee, ...payees])

  const totalSlices = payees.reduce(
    (acc, payee) => acc + BigInt(payee.shares),
    0n
  )
  await db.Slicer.create({
    id: tokenId,
    data: {
      slicerVersion,
      address: slicerAddress,
      slices: totalSlices,
      minimumSlices: minimumShares,
      createdAtTimestamp: event.block.timestamp,
      releaseTimelock,
      transferableTimelock: transferTimelock,
      protocolFee: baseFee,
      royaltyPercentage: 50,
      productsModuleBalance: 0n,
      productsModuleReleased: 0n,
      referralFeeStore: 0n,
      isImmutable: false,
      currenciesControlled: false,
      productsControlled: false,
      resliceAllowed: false,
      transferWhileControlledAllowed: false,
      acceptsAllCurrencies: false,
      storeClosed: false,
      creatorId: creator,
      controllerId: controller,
      royaltyReceiverId: creator
    }
  })

  console.log({ allPayees })

  const { items: existingPayees } = await db.Payee.findMany({
    where: {
      id: {
        in: allPayees.map((p) => p.account)
      }
    }
  })

  console.log({ existingPayees })

  const existingPayeeIds = new Set(existingPayees.map((p) => p.id))

  const newPayees = allPayees.filter((p) => !existingPayeeIds.has(p.account))

  if (newPayees.length > 0) {
    await db.Payee.createMany({
      data: newPayees.map((p) => ({ id: p.account }))
    })
  }

  // // Create any missing payee
  // for (const payee of allPayees) {
  //   await db.Payee.upsert({
  //     id: payee.account
  //   })
  // }

  // Create any missing currency
  const currenciesArray = [zeroAddress, ...currencies]
  for (const currency of currenciesArray) {
    await db.Currency.upsert({
      id: currency
    })
  }

  await db.PayeeSlicer.createMany({
    data: allPayees.map(({ account, shares, transfersAllowedWhileLocked }) => ({
      id: `${account}-${tokenId}`,
      payeeId: account,
      slicerId: tokenId,
      slices: BigInt(shares),
      transfersAllowedWhileLocked: transfersAllowedWhileLocked
    }))
  })

  await db.CurrencySlicer.createMany({
    data: currenciesArray.map((currency) => ({
      id: `${currency}-${tokenId}`,
      currencyId: currency,
      slicerId: tokenId,
      released: 0n,
      releasedToProtocol: 0n,
      creatorFeePaid: 0n
    }))
  })
})
