class Dates {
	currentDay = 0n
	currentWeek = 0n
	currentMonth = 0n
	currentYear = 0n

	static create(day: bigint, week: bigint, month: bigint, year: bigint): Dates {
		const dates = new Dates()
		dates.currentDay = day
		dates.currentWeek = week
		dates.currentMonth = month
		dates.currentYear = year
		return dates
	}
}

export function getDates(timestamp: bigint) {
	const day = timestamp / 86400n
	const week = day / 7n
	const month = day / 30n
	const year = day / 365n
	return Dates.create(day, week, month, year)
}
