import { ponder } from "@/generated"
import { zeroAddress } from "viem"
import { baseProtocolFee, defaultRoyaltyPercentage } from "@/utils/constants"
import { createPayee, reducePayees } from "@/utils/reducePayees"
import { upsertPayee } from "@/utils/upsertPayee"

ponder.on("SliceCore:TokenSliced", async ({ event, context: { db } }) => {
  const {
    slicerAddress,
    tokenId: slicerId,
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
    id: slicerId,
    data: {
      slicerVersion,
      address: slicerAddress,
      slices: totalSlices,
      minimumSlices: minimumShares,
      createdAtTimestamp: event.block.timestamp,
      releaseTimelock,
      transferableTimelock: transferTimelock,
      protocolFee: baseProtocolFee,
      royaltyPercentage: isCustomRoyaltyActive ? 0 : defaultRoyaltyPercentage,
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
  const promisePayees = allPayees.map((payee) => upsertPayee(db, payee.account))

  // Create any missing currency
  const currenciesArray = [zeroAddress, ...currencies]
  const promiseCurrencies = currenciesArray.map((currency) =>
    db.Currency.upsert({
      id: currency
    })
  )

  const promisePayeeSlicers = db.PayeeSlicer.createMany({
    data: allPayees.map(({ account, shares, transfersAllowedWhileLocked }) => ({
      id: `${account}-${slicerId}`,
      payeeId: account,
      slicerId,
      slices: BigInt(shares),
      transfersAllowedWhileLocked
    }))
  })

  const promiseCurrencySlicers = db.CurrencySlicer.createMany({
    data: currenciesArray.map((currency) => ({
      id: `${currency}-${slicerId}`,
      currencyId: currency,
      slicerId,
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
