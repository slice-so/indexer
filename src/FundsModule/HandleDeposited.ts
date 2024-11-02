import { ponder } from "@/generated"
import { upsertPayee } from "@/utils/upsertPayee"

ponder.on("FundsModule:Deposited", async ({ event, context: { db } }) => {
  const { account, currency, amount, protocolAmount } = event.args

  const promisePayee = upsertPayee(db, account)

  const promisePayeeCurrency = db.PayeeCurrency.upsert({
    id: `${account}-${currency}`,
    create: {
      payeeId: account,
      currencyId: currency,
      toWithdraw: amount - protocolAmount,
      toPayToProtocol: protocolAmount,
      withdrawn: BigInt(0),
      paidToProtocol: BigInt(0),
      totalCreatorFees: BigInt(0),
      totalReferralFees: BigInt(0)
    },
    update: ({ current }) => ({
      toWithdraw: current.toWithdraw + amount - protocolAmount,
      toPayToProtocol: current.toPayToProtocol + protocolAmount
    })
  })

  await Promise.all([promisePayee, promisePayeeCurrency])
})
