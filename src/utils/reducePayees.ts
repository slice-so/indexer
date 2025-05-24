// Filter the payees array, in case there are multiple payees with multiple shares, adds them together
// - make sure slices are added together
// - make sure transfersAllowedWhileLocked is the same for all payees
// - make sure all elements are unique and none is missing
export const reducePayees = (
	payees: readonly {
		account: `0x${string}`
		shares: number
		transfersAllowedWhileLocked: boolean
	}[]
) => {
	const reducedPayeesMap = new Map<
		`0x${string}`,
		{ shares: bigint; transfersAllowedWhileLocked: boolean }
	>()

	// Convert array to map, aggregating shares
	for (const payee of payees) {
		const currentShares = reducedPayeesMap.get(payee.account) || {
			shares: 0n,
			transfersAllowedWhileLocked: false
		}
		reducedPayeesMap.set(payee.account, {
			shares: currentShares.shares + BigInt(payee.shares),
			transfersAllowedWhileLocked: payee.transfersAllowedWhileLocked
		})
	}

	// Convert map back to array
	return Array.from(
		reducedPayeesMap,
		([account, { shares, transfersAllowedWhileLocked }]) => ({
			account,
			shares,
			transfersAllowedWhileLocked
		})
	)
}

export const createPayee = (
	account: `0x${string}`,
	shares = 0,
	transfersAllowedWhileLocked = false
) => ({
	account,
	shares,
	transfersAllowedWhileLocked
})
