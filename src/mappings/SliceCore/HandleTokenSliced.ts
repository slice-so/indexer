import { ponder } from "ponder:registry"
import {
  currencySlicer,
  currency as currencyTable,
  payeeSlicer,
  slicer
} from "ponder:schema"
import {
  baseProtocolFee,
  createPayee,
  defaultRoyaltyPercentage,
  reducePayees,
  upsertPayees
} from "@/utils"
import { zeroAddress } from "viem"

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

  const promiseSlicer = db.insert(slicer).values({
    id: Number(slicerId),
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
      : controller !== zeroAddress
        ? controller
        : creator,
    totalOrders: 0n,
    totalProductsPurchased: 0n,
    totalEarnedUsd: 0n,
    releasedUsd: 0n
  })

  // Create any missing payee
  const promisePayees = upsertPayees(
    db,
    allPayees.map((payee) => payee.account)
  )

  // Create any missing currency
  const currenciesArray = [zeroAddress, ...currencies]
  const promiseCurrencies = db
    .insert(currencyTable)
    .values(currenciesArray.map((currency) => ({ id: currency })))
    .onConflictDoNothing()

  const promisePayeeSlicers = db.insert(payeeSlicer).values(
    allPayees.map(({ account, shares, transfersAllowedWhileLocked }) => ({
      payeeId: account,
      slicerId: Number(slicerId),
      slices: shares,
      transfersAllowedWhileLocked
    }))
  )

  const promiseCurrencySlicers = db.insert(currencySlicer).values(
    currenciesArray.map((currency) => ({
      currencyId: currency,
      slicerId: Number(slicerId),
      released: 0n,
      releasedToProtocol: 0n,
      creatorFeePaid: 0n,
      referralFeePaid: 0n,
      releasedUsd: 0n,
      totalEarned: 0n
    }))
  )

  await Promise.all([
    promiseSlicer,
    promisePayees,
    promiseCurrencies,
    promisePayeeSlicers,
    promiseCurrencySlicers
  ])
})
