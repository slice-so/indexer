import { ponder } from "@/generated"
import { zeroAddress } from "viem"
import { baseProtocolFee, defaultRoyaltyPercentage } from "./utils/constants"
import { reducePayees } from "./utils/reducePayees"
import { createPayee } from "./utils/createPayee"

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

ponder.on("SliceCore:TokenResliced", async ({ event, context: { db } }) => {
  const { tokenId: slicerId, accounts, tokensDiffs } = event.args

  // Create any missing payee
  const promisePayees = accounts.map((address) =>
    db.Payee.upsert({
      id: address
    })
  )

  let totalDiff = 0n
  const promisePayeeSlicers = accounts.map((address, index) => {
    const tokenDiff = BigInt(tokensDiffs[index]!)

    totalDiff += tokenDiff

    return db.PayeeSlicer.upsert({
      id: `${address}-${slicerId}`,
      create: {
        payeeId: address,
        slicerId,
        slices: tokenDiff,
        transfersAllowedWhileLocked: false
      },
      update: ({ current }) => ({
        slices: current.slices + tokenDiff
      })
    })
  })

  const promiseSlicer = db.Slicer.update({
    id: slicerId,
    data: ({ current }) => ({ slices: current.slices + totalDiff })
  })

  await Promise.all([
    promiseSlicer,
    ...promisePayees,
    ...promisePayeeSlicers,
    promiseSlicer
  ])
})

ponder.on(
  "SliceCore:SlicerControllerSet",
  async ({ event, context: { db } }) => {
    const { tokenId: slicerId, slicerController } = event.args

    const promisePayee = db.Payee.upsert({
      id: slicerController
    })

    const promiseSlicer = db.Slicer.update({
      id: slicerId,
      data: ({ current }) => ({
        royaltyReceiverId:
          current.royaltyReceiverId !== current.address
            ? slicerController
            : current.royaltyReceiverId,
        controllerId: slicerController
      })
    })

    await Promise.all([promisePayee, promiseSlicer])
  }
)

ponder.on("SliceCore:RoyaltySet", async ({ event, context: { db } }) => {
  const {
    tokenId: slicerId,
    isSlicer,
    isActive,
    royaltyPercentage
  } = event.args

  await db.Slicer.update({
    id: slicerId,
    data: ({ current }) => ({
      royaltyPercentage: isActive
        ? Number(royaltyPercentage)
        : defaultRoyaltyPercentage,
      royaltyReceiverId: isSlicer
        ? current.address
        : current.controllerId !== zeroAddress
        ? current.controllerId
        : current.creatorId
    })
  })
})

ponder.on("SliceCore:TransferSingle", async ({ event, context: { db } }) => {
  const { from, to, id: slicerId, value } = event.args

  if (from !== zeroAddress && to !== zeroAddress && from !== to) {
    const promisePayeeTo = db.Payee.upsert({
      id: to
    })

    const promisePayeeSlicerFrom = db.PayeeSlicer.update({
      id: `${from}-${slicerId}`,
      data: ({ current }) => ({ slices: current.slices - value })
    })

    const promisePayeeSlicerTo = db.PayeeSlicer.upsert({
      id: `${to}-${slicerId}`,
      create: {
        payeeId: to,
        slicerId,
        slices: value,
        transfersAllowedWhileLocked: false
      },
      update: ({ current }) => ({ slices: current.slices + value })
    })

    await Promise.all([
      promisePayeeTo,
      promisePayeeSlicerFrom,
      promisePayeeSlicerTo
    ])
  }
})

ponder.on("SliceCore:TransferBatch", async ({ event, context: { db } }) => {
  const { from, to, ids, values } = event.args

  if (from !== zeroAddress && to !== zeroAddress && from !== to) {
    const promisePayeeTo = db.Payee.upsert({
      id: to
    })

    const promisePayeeSlicerFrom = ids.map((id, index) =>
      db.PayeeSlicer.update({
        id: `${from}-${id}`,
        data: ({ current }) => ({ slices: current.slices - values[index]! })
      })
    )

    const promisePayeeSlicerTo = ids.map((id, index) =>
      db.PayeeSlicer.upsert({
        id: `${to}-${id}`,
        create: {
          payeeId: to,
          slicerId: id,
          slices: values[index]!,
          transfersAllowedWhileLocked: false
        },
        update: ({ current }) => ({ slices: current.slices + values[index]! })
      })
    )

    await Promise.all([
      promisePayeeTo,
      ...promisePayeeSlicerFrom,
      ...promisePayeeSlicerTo
    ])
  }
})
