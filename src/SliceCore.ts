import { ponder } from "@/generated"
import { zeroAddress } from "viem"
import { baseProtocolFee } from "./utils/constants"
import { reducePayees } from "./utils/reducePayees"
import { createPayee } from "./utils/createPayee"

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

  // Boolean flags ordered right to left: [isImmutable, currenciesControlled, productsControlled, acceptsAllCurrencies]
  const isImmutable = (slicerFlags & 1) !== 0
  const currenciesControlled = (slicerFlags & 2) !== 0
  const productsControlled = (slicerFlags & 4) !== 0
  const acceptsAllCurrencies = (slicerFlags & 8) !== 0

  // Boolean flags ordered right to left: [isCustomRoyaltyActive, isRoyaltyReceiverSlicer, resliceAllowed, transferWhileControlledAllowed]
  const isCustomRoyaltyActive = (sliceCoreFlags & 1) !== 0
  const isRoyaltyReceiverSlicer = (sliceCoreFlags & 2) !== 0
  const resliceAllowed = (sliceCoreFlags & 4) !== 0
  const transferWhileControlledAllowed = (sliceCoreFlags & 8) !== 0

  const allPayees = reducePayees([
    createPayee(creator),
    createPayee(slicerAddress),
    ...payees
  ])

  const totalSlices = payees.reduce(
    (acc, payee) => acc + BigInt(payee.shares),
    0n
  )

  const promiseSlicer = db.Slicer.create({
    id: tokenId,
    data: {
      slicerVersion,
      address: slicerAddress,
      slices: totalSlices,
      minimumSlices: minimumShares,
      createdAtTimestamp: event.block.timestamp,
      releaseTimelock,
      transferableTimelock: transferTimelock,
      protocolFee: baseProtocolFee,
      royaltyPercentage: isCustomRoyaltyActive ? 0 : 50,
      productsModuleBalance: 0n,
      productsModuleReleased: 0n,
      referralFeeStore: 0n,
      isImmutable,
      currenciesControlled,
      productsControlled,
      resliceAllowed,
      transferWhileControlledAllowed,
      acceptsAllCurrencies,
      storeClosed: false,
      creatorId: creator,
      controllerId: controller,
      royaltyReceiverId: isRoyaltyReceiverSlicer
        ? slicerAddress
        : controller != zeroAddress
        ? controller
        : creator
    }
  })

  // Create any missing payee
  const promisePayees = allPayees.map((payee) =>
    db.Payee.upsert({
      id: payee.account
    })
  )

  // Create any missing currency
  const currenciesArray = [zeroAddress, ...currencies]
  const promiseCurrencies = currenciesArray.map((currency) =>
    db.Currency.upsert({
      id: currency
    })
  )

  const promisePayeeSlicers = db.PayeeSlicer.createMany({
    data: allPayees.map(({ account, shares, transfersAllowedWhileLocked }) => ({
      id: `${account}-${tokenId}`,
      payeeId: account,
      slicerId: tokenId,
      slices: BigInt(shares),
      transfersAllowedWhileLocked
    }))
  })

  const promiseCurrencySlicers = db.CurrencySlicer.createMany({
    data: currenciesArray.map((currency) => ({
      id: `${currency}-${tokenId}`,
      currencyId: currency,
      slicerId: tokenId,
      released: 0n,
      releasedToProtocol: 0n,
      creatorFeePaid: 0n,
      referralFeePaid: 0n
    }))
  })

  await Promise.all([
    promiseSlicer,
    ...promisePayees,
    ...promiseCurrencies,
    promisePayeeSlicers,
    promiseCurrencySlicers
  ])
})
