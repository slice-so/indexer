import { ponder } from "ponder:registry"
import { order } from "ponder:schema"
import { upsertPayee } from "@/utils"
import { zeroAddress } from "viem"
ponder.on(
	"ProductsModule:PurchaseMade",
	async ({ event: { args, block, transaction }, context: { db } }) => {
		const { buyer } = args

		const promises = [
			db
				.insert(order)
				.values({
					id: transaction.hash,
					timestamp: block.timestamp,
					totalPaymentUsd: 0n,
					totalReferralUsd: 0n,
					payerId: transaction.from,
					buyerId: buyer,
					referrerId: zeroAddress
				})
				.onConflictDoUpdate((row) => ({
					buyerId: row.buyerId === zeroAddress ? buyer : row.buyerId
				})),
			...(buyer !== zeroAddress ? [upsertPayee(db, buyer)] : [])
		]

		await Promise.all(promises)
	}
)
