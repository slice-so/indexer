import { type Context, ponder } from "ponder:registry"
import {
  extraCost,
  order,
  orderSlicer,
  slicer,
  slicerStatsByDay,
  slicerStatsByMonth,
  slicerStatsByWeek,
  slicerStatsByYear,
  slicer as slicerTable
} from "ponder:schema"
import { getDates, getUsdcAmount, upsertPayee } from "@/utils"
import { eq } from "ponder"
import { zeroAddress } from "viem"

ponder.on(
  "ProductsModule:ExtraCostPaid",
  async ({ event: { args, block, transaction }, context }) => {
    const { db } = context
    const { currency, amount, description, recipient } = args

    const [slicer, amountUsd] = await Promise.all([
      db.sql.query.slicer.findFirst({
        where: eq(slicerTable.address, recipient)
      }),
      getUsdcAmount(context, currency, amount)
    ])
    const slicerId = slicer?.id

    const extraCostPromise = db
      .insert(extraCost)
      .values({
        orderId: transaction.hash,
        recipient,
        currencyId: currency,
        description,
        slicerId: slicerId ?? undefined,
        amount,
        amountUsd
      })
      .onConflictDoUpdate((row) => ({
        amount: row.amount + amount,
        amountUsd: row.amountUsd + amountUsd
      }))

    const payeePromise = upsertPayee(db, transaction.from)

    // edge case: if the order is created in this event, it means no products were purchased.
    const orderPromise = db
      .insert(order)
      .values({
        id: transaction.hash,
        timestamp: block.timestamp,
        totalPaymentUsd: amountUsd,
        totalReferralUsd: 0n,
        payerId: transaction.from,
        buyerId: zeroAddress,
        referrerId: zeroAddress
      })
      .onConflictDoNothing()

    const orderSlicerPromises = []
    if (slicer) {
      const existingOrderSlicer = await db.find(orderSlicer, {
        orderId: transaction.hash,
        slicerId: slicer.id
      })

      orderSlicerPromises.push(
        db
          .insert(orderSlicer)
          .values({
            orderId: transaction.hash,
            slicerId: slicer.id,
            totalPaymentUsd: amountUsd,
            totalReferralUsd: 0n
          })
          .onConflictDoUpdate((row) => ({
            totalPaymentUsd: row.totalPaymentUsd + amountUsd
          }))
      )

      if (!existingOrderSlicer) {
        orderSlicerPromises.push(
          ...updateSlicerStatsTotalOrders({
            db,
            slicerId: slicer.id,
            timestamp: block.timestamp,
            amountUsd
          })
        )
      }
    }

    await Promise.all([
      extraCostPromise,
      payeePromise,
      orderPromise,
      ...orderSlicerPromises
    ])
  }
)

const updateSlicerStatsTotalOrders = ({
  db,
  slicerId,
  timestamp,
  amountUsd
}: {
  db: Context["db"]
  slicerId: number
  timestamp: bigint
  amountUsd: bigint
}) => {
  const promises = []

  // Update slicer and stats tables for new orderSlicer (i.e. new order for this slicer)
  const { currentDay, currentWeek, currentMonth, currentYear } =
    getDates(timestamp)

  // Update slicer totalOrders
  promises.push(
    db.update(slicer, { id: slicerId }).set((row) => ({
      totalOrders: row.totalOrders + 1n
    }))
  )

  // Upsert stats by year
  promises.push(
    db
      .insert(slicerStatsByYear)
      .values({
        slicerId,
        year: currentYear,
        totalOrders: 1n,
        totalProductsPurchased: 0n,
        totalEarnedUsd: amountUsd
      })
      .onConflictDoUpdate((row) => ({
        totalOrders: row.totalOrders + 1n,
        totalEarnedUsd: row.totalEarnedUsd + amountUsd
      }))
  )

  // Upsert stats by month
  promises.push(
    db
      .insert(slicerStatsByMonth)
      .values({
        slicerId,
        yearKey: currentYear,
        month: currentMonth,
        totalOrders: 1n,
        totalProductsPurchased: 0n,
        totalEarnedUsd: amountUsd
      })
      .onConflictDoUpdate((row) => ({
        totalOrders: row.totalOrders + 1n,
        totalEarnedUsd: row.totalEarnedUsd + amountUsd
      }))
  )

  // Upsert stats by week
  promises.push(
    db
      .insert(slicerStatsByWeek)
      .values({
        slicerId,
        yearKey: currentYear,
        monthKey: currentMonth,
        week: currentWeek,
        totalOrders: 1n,
        totalProductsPurchased: 0n,
        totalEarnedUsd: amountUsd
      })
      .onConflictDoUpdate((row) => ({
        totalOrders: row.totalOrders + 1n,
        totalEarnedUsd: row.totalEarnedUsd + amountUsd
      }))
  )

  // Upsert stats by day
  promises.push(
    db
      .insert(slicerStatsByDay)
      .values({
        slicerId,
        yearKey: currentYear,
        monthKey: currentMonth,
        weekKey: currentWeek,
        day: currentDay,
        totalOrders: 1n,
        totalProductsPurchased: 0n,
        totalEarnedUsd: amountUsd
      })
      .onConflictDoUpdate((row) => ({
        totalOrders: row.totalOrders + 1n,
        totalEarnedUsd: row.totalEarnedUsd + amountUsd
      }))
  )

  return promises
}
