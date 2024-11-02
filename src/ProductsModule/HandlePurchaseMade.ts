import { ponder } from "@/generated"
import { upsertPayee } from "@/utils/upsertPayee"
import { zeroAddress } from "viem"

ponder.on(
  "ProductsModule:PurchaseMade",
  async ({ event: { args, block, transaction }, context: { db } }) => {
    const { buyer } = args

    await db.Order.upsert({
      id: transaction.hash,
      create: {
        timestamp: block.timestamp,
        totalPaymentEth: 0n,
        totalPaymentCurrency: 0n,
        totalReferralEth: 0n,
        totalReferralCurrency: 0n,
        payerId: transaction.from,
        buyerId: buyer,
        referrerId: zeroAddress
      },
      update: ({ current }) => {
        return {
          buyerId: current.buyerId === zeroAddress ? buyer : current.buyerId
        }
      }
    })

    if (buyer !== zeroAddress) {
      await upsertPayee(db, buyer)
    }
  }
)
