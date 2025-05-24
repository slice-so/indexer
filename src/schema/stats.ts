import { index, onchainTable, primaryKey, relations } from "ponder"
import { currency, slicer } from "./tables"

export const slicerStatsByDay = onchainTable(
	"slicer_stats_day",
	(t) => ({
		slicerId: t.integer().notNull(),
		day: t.bigint().notNull(),
		weekKey: t.bigint().notNull(),
		monthKey: t.bigint().notNull(),
		yearKey: t.bigint().notNull(),
		totalOrders: t.bigint().notNull(),
		totalProductsPurchased: t.bigint().notNull(),
		totalEarnedUsd: t.bigint().notNull()
	}),
	(tbl) => ({
		pk: primaryKey({ columns: [tbl.slicerId, tbl.day] }),
		slicerIdx: index().on(tbl.slicerId),
		dayIdx: index().on(tbl.day)
	})
)

export const slicerStatsByWeek = onchainTable(
	"slicer_stats_week",
	(t) => ({
		slicerId: t.integer().notNull(),
		week: t.bigint().notNull(),
		monthKey: t.bigint().notNull(),
		yearKey: t.bigint().notNull(),
		totalOrders: t.bigint().notNull(),
		totalProductsPurchased: t.bigint().notNull(),
		totalEarnedUsd: t.bigint().notNull()
	}),
	(tbl) => ({
		pk: primaryKey({ columns: [tbl.slicerId, tbl.week] }),
		slicerIdx: index().on(tbl.slicerId),
		weekIdx: index().on(tbl.week)
	})
)

export const slicerStatsByMonth = onchainTable(
	"slicer_stats_month",
	(t) => ({
		slicerId: t.integer().notNull(),
		month: t.bigint().notNull(),
		yearKey: t.bigint().notNull(),
		totalOrders: t.bigint().notNull(),
		totalProductsPurchased: t.bigint().notNull(),
		totalEarnedUsd: t.bigint().notNull()
	}),
	(tbl) => ({
		pk: primaryKey({ columns: [tbl.slicerId, tbl.month] }),
		slicerIdx: index().on(tbl.slicerId),
		monthIdx: index().on(tbl.month)
	})
)

export const slicerStatsByYear = onchainTable(
	"slicer_stats_year",
	(t) => ({
		slicerId: t.integer().notNull(),
		year: t.bigint().notNull(),
		totalOrders: t.bigint().notNull(),
		totalProductsPurchased: t.bigint().notNull(),
		totalEarnedUsd: t.bigint().notNull()
	}),
	(tbl) => ({
		pk: primaryKey({ columns: [tbl.slicerId, tbl.year] }),
		slicerIdx: index().on(tbl.slicerId),
		yearIdx: index().on(tbl.year)
	})
)

export const currencySlicerDay = onchainTable(
	"currency_slicer_day",
	(t) => ({
		slicerId: t.integer().notNull(),
		currencyId: t.hex().notNull(),
		totalEarned: t.bigint().notNull(),
		day: t.bigint().notNull()
	}),
	(tbl) => ({
		pk: primaryKey({
			columns: [tbl.slicerId, tbl.currencyId, tbl.day]
		})
	})
)
export const currencySlicerWeek = onchainTable(
	"currency_slicer_week",
	(t) => ({
		slicerId: t.integer().notNull(),
		currencyId: t.hex().notNull(),
		totalEarned: t.bigint().notNull(),
		week: t.bigint().notNull()
	}),
	(tbl) => ({
		pk: primaryKey({
			columns: [tbl.slicerId, tbl.currencyId, tbl.week]
		})
	})
)
export const currencySlicerMonth = onchainTable(
	"currency_slicer_month",
	(t) => ({
		slicerId: t.integer().notNull(),
		currencyId: t.hex().notNull(),
		totalEarned: t.bigint().notNull(),
		month: t.bigint().notNull()
	}),
	(tbl) => ({
		pk: primaryKey({
			columns: [tbl.slicerId, tbl.currencyId, tbl.month]
		})
	})
)
export const currencySlicerYear = onchainTable(
	"currency_slicer_year",
	(t) => ({
		slicerId: t.integer().notNull(),
		currencyId: t.hex().notNull(),
		totalEarned: t.bigint().notNull(),
		year: t.bigint().notNull()
	}),
	(tbl) => ({
		pk: primaryKey({
			columns: [tbl.slicerId, tbl.currencyId, tbl.year]
		})
	})
)

export const currencySlicerDayRelations = relations(
	currencySlicerDay,
	({ one }) => ({
		slicer: one(slicer, {
			fields: [currencySlicerDay.slicerId],
			references: [slicer.id]
		}),
		currency: one(currency, {
			fields: [currencySlicerDay.currencyId],
			references: [currency.id]
		}),
		statsByDay: one(slicerStatsByDay, {
			fields: [currencySlicerDay.slicerId, currencySlicerDay.day],
			references: [slicerStatsByDay.slicerId, slicerStatsByDay.day]
		})
	})
)

export const currencySlicerWeekRelations = relations(
	currencySlicerWeek,
	({ one }) => ({
		slicer: one(slicer, {
			fields: [currencySlicerWeek.slicerId],
			references: [slicer.id]
		}),
		currency: one(currency, {
			fields: [currencySlicerWeek.currencyId],
			references: [currency.id]
		}),
		statsByWeek: one(slicerStatsByWeek, {
			fields: [currencySlicerWeek.slicerId, currencySlicerWeek.week],
			references: [slicerStatsByWeek.slicerId, slicerStatsByWeek.week]
		})
	})
)

export const currencySlicerMonthRelations = relations(
	currencySlicerMonth,
	({ one }) => ({
		slicer: one(slicer, {
			fields: [currencySlicerMonth.slicerId],
			references: [slicer.id]
		}),
		currency: one(currency, {
			fields: [currencySlicerMonth.currencyId],
			references: [currency.id]
		}),
		statsByMonth: one(slicerStatsByMonth, {
			fields: [currencySlicerMonth.slicerId, currencySlicerMonth.month],
			references: [slicerStatsByMonth.slicerId, slicerStatsByMonth.month]
		})
	})
)

export const currencySlicerYearRelations = relations(
	currencySlicerYear,
	({ one }) => ({
		slicer: one(slicer, {
			fields: [currencySlicerYear.slicerId],
			references: [slicer.id]
		}),
		currency: one(currency, {
			fields: [currencySlicerYear.currencyId],
			references: [currency.id]
		}),
		statsByYear: one(slicerStatsByYear, {
			fields: [currencySlicerYear.slicerId, currencySlicerYear.year],
			references: [slicerStatsByYear.slicerId, slicerStatsByYear.year]
		})
	})
)

export const slicerStatsDayRelations = relations(
	slicerStatsByDay,
	({ one, many }) => ({
		slicer: one(slicer, {
			fields: [slicerStatsByDay.slicerId],
			references: [slicer.id]
		}),
		week: one(slicerStatsByWeek, {
			fields: [slicerStatsByDay.slicerId, slicerStatsByDay.weekKey],
			references: [slicerStatsByWeek.slicerId, slicerStatsByWeek.week]
		}),
		month: one(slicerStatsByMonth, {
			fields: [slicerStatsByDay.slicerId, slicerStatsByDay.monthKey],
			references: [slicerStatsByMonth.slicerId, slicerStatsByMonth.month]
		}),
		year: one(slicerStatsByYear, {
			fields: [slicerStatsByDay.slicerId, slicerStatsByDay.yearKey],
			references: [slicerStatsByYear.slicerId, slicerStatsByYear.year]
		}),
		totalEarnedByCurrency: many(currencySlicerDay)
	})
)

export const slicerStatsWeekRelations = relations(
	slicerStatsByWeek,
	({ one, many }) => ({
		slicer: one(slicer, {
			fields: [slicerStatsByWeek.slicerId],
			references: [slicer.id]
		}),
		days: many(slicerStatsByDay, { relationName: "days" }),
		month: one(slicerStatsByMonth, {
			fields: [slicerStatsByWeek.slicerId, slicerStatsByWeek.monthKey],
			references: [slicerStatsByMonth.slicerId, slicerStatsByMonth.month]
		}),
		year: one(slicerStatsByYear, {
			fields: [slicerStatsByWeek.slicerId, slicerStatsByWeek.yearKey],
			references: [slicerStatsByYear.slicerId, slicerStatsByYear.year]
		}),
		totalEarnedByCurrency: many(currencySlicerWeek)
	})
)

export const slicerStatsMonthRelations = relations(
	slicerStatsByMonth,
	({ one, many }) => ({
		slicer: one(slicer, {
			fields: [slicerStatsByMonth.slicerId],
			references: [slicer.id]
		}),
		days: many(slicerStatsByDay, { relationName: "days" }),
		weeks: many(slicerStatsByWeek, { relationName: "weeks" }),
		year: one(slicerStatsByYear, {
			fields: [slicerStatsByMonth.slicerId, slicerStatsByMonth.yearKey],
			references: [slicerStatsByYear.slicerId, slicerStatsByYear.year]
		}),
		totalEarnedByCurrency: many(currencySlicerMonth)
	})
)

export const slicerStatsYearRelations = relations(
	slicerStatsByYear,
	({ one, many }) => ({
		slicer: one(slicer, {
			fields: [slicerStatsByYear.slicerId],
			references: [slicer.id]
		}),
		days: many(slicerStatsByDay),
		weeks: many(slicerStatsByWeek),
		months: many(slicerStatsByMonth),
		totalEarnedByCurrency: many(currencySlicerYear)
	})
)
