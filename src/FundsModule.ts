import { ponder } from "@/generated"

ponder.on("FundsModule:Deposited", async ({ event, context: { db } }) => {
  const { account, currency, amount, protocolAmount } = event.args

  const promisePayee = db.Payee.upsert({
    id: account
  })

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

ponder.on("FundsModule:Withdrawn", async ({ event, context: { db } }) => {
  const { account, currency, withdrawAmount, protocolPayment } = event.args

  const promisePayee = db.Payee.upsert({
    id: account
  })

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
