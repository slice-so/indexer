import { Context, ponder } from "@/generated"
import { baseProtocolFee } from "./utils/constants"
import { getSlicerId } from "./utils/getSlicerId"
import { Address } from "viem"

ponder.on(
  "Slicer:Released(address indexed payee, address indexed currency, uint256 amountReleased, uint256 protocolPayment)",
  async ({ event, context: { db } }) => {
    const { payee, currency, amountReleased, protocolPayment } = event.args
    await handleReleased({
      slicerAddress: event.log.address,
      payee,
      currency,
      amountReleased,
      protocolPayment,
      timestamp: event.block.timestamp,
      db
    })
  }
)

ponder.on(
  "Slicer:Released(address indexed payee, address indexed currency, uint256 amountReleased, uint256 creatorPayment, uint256 protocolPayment)",
  async ({ event, context: { db } }) => {
    const { payee, currency, amountReleased, creatorPayment, protocolPayment } =
      event.args
    await handleReleased({
      slicerAddress: event.log.address,
      payee,
      currency,
      amountReleased,
      protocolPayment,
      creatorPayment,
      timestamp: event.block.timestamp,
      db
    })
  }
)

ponder.on("Slicer:CurrenciesAdded", async ({ event, context: { db } }) => {
  const { currencies } = event.args
  const slicerId = await getSlicerId(event.log.address, db)

  const { items: currencySlicers } = await db.CurrencySlicer.findMany({
    where: {
      slicerId
    }
  })

  const missingCurrencies = currencies.filter(
    (currency) =>
      !currencySlicers.some(
        (cs) => cs.currencyId.toLowerCase() === currency.toLowerCase()
      )
  )

  const promiseCurrencies = currencies.map((currency) =>
    db.Currency.upsert({
      id: currency
    })
  )

  const promiseCurrencySlicers = db.CurrencySlicer.createMany({
    data: missingCurrencies.map((currency) => ({
      id: `${currency}-${slicerId}`,
      currencyId: currency,
      slicerId,
      released: 0n,
      releasedToProtocol: 0n,
      creatorFeePaid: 0n,
      referralFeePaid: 0n
    }))
  })

  await Promise.all([...promiseCurrencies, promiseCurrencySlicers])
})

ponder.on("Slicer:ChildSlicerSet", async ({ event, context: { db } }) => {
  const { slicerId: childSlicerId, addChildSlicerMode: isAdded } = event.args
  const parentSlicerId = await getSlicerId(event.log.address, db)

  if (isAdded) {
    await db.SlicerRelation.upsert({
      id: `${parentSlicerId}-${childSlicerId}`,
      create: {
        parentSlicerId,
        childSlicerId
      },
      update: {
        parentSlicerId,
        childSlicerId
      }
    })
  } else {
    await db.SlicerRelation.delete({
      id: `${parentSlicerId}-${childSlicerId}`
    })
  }
})

ponder.on("Slicer:CustomFeeSet", async ({ event, context: { db } }) => {
  const { customFeeActive, customFee } = event.args
  const slicerId = await getSlicerId(event.log.address, db)

  await db.Slicer.update({
    id: slicerId,
    data: { protocolFee: customFeeActive ? Number(customFee) : baseProtocolFee }
  })
})

const handleReleased = async ({
  slicerAddress,
  payee,
  currency,
  amountReleased,
  protocolPayment,
  timestamp,
  db,
  creatorPayment = 0n
}: {
  slicerAddress: Address
  payee: Address
  currency: Address
  amountReleased: bigint
  protocolPayment: bigint
  timestamp: bigint
  db: Context["db"]
  creatorPayment?: bigint
}) => {
  const slicerId = await getSlicerId(slicerAddress, db)

  const promiseCurrencySlicer = db.CurrencySlicer.upsert({
    id: `${currency}-${slicerId}`,
    create: {
      currencyId: currency,
      slicerId: slicerId,
      released: amountReleased,
      releasedToProtocol: protocolPayment,
      creatorFeePaid: creatorPayment,
      referralFeePaid: 0n
    },
    update: ({ current }: { current: any }) => ({
      released: current.released + amountReleased,
      releasedToProtocol: current.releasedToProtocol + protocolPayment,
      creatorFeePaid: current.creatorFeePaid + creatorPayment
    })
  })

  const promiseReleaseEvent = db.ReleaseEvent.create({
    id: `${slicerId}-${currency}-${payee}-${timestamp}`,
    data: {
      slicerId,
      currencyId: currency,
      payeeId: payee,
      currencySlicerId: `${currency}-${slicerId}`,
      amountReleased,
      timestamp: timestamp
    }
  })

  let promisePayee = null
  let promisePayeeCurrency = null
  if (creatorPayment > 0n) {
    promisePayee = db.Payee.upsert({
      id: payee
    })

    promisePayeeCurrency = db.PayeeCurrency.upsert({
      id: `${payee}-${currency}`,
      create: {
        payeeId: payee,
        currencyId: currency,
        toWithdraw: 0n,
        toPayToProtocol: 0n,
        withdrawn: 0n,
        paidToProtocol: 0n,
        totalReferralFees: 0n,
        totalCreatorFees: creatorPayment
      },
      update: ({ current }: { current: any }) => ({
        totalCreatorFees: current.totalCreatorFees + creatorPayment
      })
    })
  }

  await Promise.all([
    promiseCurrencySlicer,
    promiseReleaseEvent,
    promisePayee,
    promisePayeeCurrency
  ])
}
