import { ponder } from "ponder:registry"
import { currencySlicer, currency as currencyTable } from "@/schema/tables"
import { getSlicerId } from "@/utils"

ponder.on("Slicer:CurrenciesAdded", async ({ event, context: { db } }) => {
  const { currencies } = event.args
  const slicerId = await getSlicerId(event.log.address, db)

  const currencySlicers = await db.sql.query.currencySlicer.findMany({
    where: (table, { eq }) => eq(table.slicerId, slicerId)
  })

  const missingCurrencies = currencies.filter(
    (currency) =>
      !currencySlicers.some(
        (cs) => cs.currencyId.toLowerCase() === currency.toLowerCase()
      )
  )

  const promiseCurrencies = db
    .insert(currencyTable)
    .values(currencies.map((currency) => ({ id: currency })))
    .onConflictDoNothing()

  const promiseCurrencySlicers = db.insert(currencySlicer).values(
    missingCurrencies.map((currency) => ({
      currencyId: currency,
      slicerId,
      released: 0n,
      releasedToProtocol: 0n,
      creatorFeePaid: 0n,
      referralFeePaid: 0n,
      releasedUsd: 0n,
      totalEarned: 0n
    }))
  )

  await Promise.all([promiseCurrencies, promiseCurrencySlicers])
})
