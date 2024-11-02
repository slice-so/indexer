import { ponder } from "@/generated"
import { upsertPayee } from "@/utils/upsertPayee"
import { zeroAddress } from "viem"

ponder.on(
  "ProductsModule:ExtraCostPaid",
  async ({ event: { args, block, transaction }, context: { db } }) => {
    const { currency, amount, description, recipient } = args
    const id = `${transaction.hash}-${currency}-${recipient}-${description}`

    const { items: slicer } = await db.Slicer.findMany({
      where: {
        address: recipient
      },
      limit: 1
    })
    const slicerId = slicer[0]?.id

    const extraCostPromise = db.ExtraCost.upsert({
      id,
      create: {
        amount,
        description,
        recipient: slicerId != undefined ? undefined : recipient,
        slicerId: slicerId != undefined ? slicerId : undefined,
        orderId: transaction.hash,
        currencyId: currency
      },
      update: ({ current }) => ({
        amount: current.amount + amount
      })
    })

    const payeePromise = upsertPayee(db, transaction.from)

    // edge case: if the order is created in this event, it means no products were purchased.
    const orderPromise = db.Order.upsert({
      id: transaction.hash,
      create: {
        timestamp: block.timestamp,
        totalPaymentEth: 0n,
        totalPaymentCurrency: 0n,
        totalReferralEth: 0n,
        totalReferralCurrency: 0n,
        payerId: transaction.from,
        buyerId: zeroAddress,
        referrerId: zeroAddress
      },
      update: {}
    })

    await Promise.all([extraCostPromise, payeePromise, orderPromise])
  }
)
