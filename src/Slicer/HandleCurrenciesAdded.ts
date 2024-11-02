import { ponder } from "@/generated"
import { getSlicerId } from "@/utils/getSlicerId"

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
