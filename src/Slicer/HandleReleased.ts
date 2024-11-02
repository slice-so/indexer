import { Context, ponder } from "@/generated"
import { getSlicerId } from "@/utils/getSlicerId"
import { upsertPayee } from "@/utils/upsertPayee"
import { Address } from "viem"

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
    promisePayee = upsertPayee(db, payee)

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
