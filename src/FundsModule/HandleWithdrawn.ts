import { ponder } from "@/generated"
import { upsertPayee } from "@/utils/upsertPayee"

ponder.on("FundsModule:Withdrawn", async ({ event, context: { db } }) => {
  const { account, currency, withdrawAmount, protocolPayment } = event.args

  const promisePayee = upsertPayee(db, account)

  const promisePayeeCurrency = db.PayeeCurrency.upsert({
    id: `${account}-${currency}`,
    create: {
      payeeId: account,
      currencyId: currency,
      withdrawn: withdrawAmount,
      paidToProtocol: protocolPayment,
      toWithdraw: BigInt(1),
      toPayToProtocol: BigInt(1),
      totalCreatorFees: BigInt(0),
      totalReferralFees: BigInt(0)
    },
    update: ({ current }) => ({
      withdrawn: current.withdrawn + withdrawAmount,
      paidToProtocol: current.paidToProtocol + protocolPayment
    })
  })

  await Promise.all([promisePayee, promisePayeeCurrency])
})
