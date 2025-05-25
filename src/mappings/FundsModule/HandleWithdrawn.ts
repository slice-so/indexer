import { ponder } from "ponder:registry"
import { payeeCurrency } from "@/schema/tables"
import { upsertPayee } from "@/utils"

ponder.on("FundsModule:Withdrawn", async ({ event, context: { db } }) => {
  const { account, currency, withdrawAmount, protocolPayment } = event.args

  const promisePayee = upsertPayee(db, account)

  const promisePayeeCurrency = db
    .insert(payeeCurrency)
    .values({
      payeeId: account,
      currencyId: currency,
      withdrawn: withdrawAmount,
      paidToProtocol: protocolPayment,
      toWithdraw: 1n,
      toPayToProtocol: 1n,
      totalCreatorFees: 0n,
      totalReferralFees: 0n,
      totalReferralFeesUsd: 0n
    })
    .onConflictDoUpdate((row) => ({
      withdrawn: row.withdrawn + withdrawAmount,
      paidToProtocol: row.paidToProtocol + protocolPayment
    }))

  await Promise.all([promisePayee, promisePayeeCurrency])
})
