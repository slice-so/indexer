import { ponder } from "ponder:registry"
import { payeeCurrency } from "@/schema/tables"
import { upsertPayee } from "@/utils"

ponder.on("FundsModule:Deposited", async ({ event, context: { db } }) => {
	const { account, currency, amount, protocolAmount } = event.args

	const promisePayee = upsertPayee(db, account)

	const promisePayeeCurrency = db
		.insert(payeeCurrency)
		.values({
			payeeId: account,
			currencyId: currency,
			toWithdraw: amount - protocolAmount,
			toPayToProtocol: protocolAmount,
			withdrawn: 0n,
			paidToProtocol: 0n,
			totalCreatorFees: 0n,
			totalReferralFees: 0n,
			totalReferralFeesUsd: 0n
		})
		.onConflictDoUpdate((row) => ({
			toWithdraw: row.toWithdraw + amount - protocolAmount,
			toPayToProtocol: row.toPayToProtocol + protocolAmount
		}))

	await Promise.all([promisePayee, promisePayeeCurrency])
})
