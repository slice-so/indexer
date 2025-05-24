import { ponder } from "ponder:registry"
import { payeeSlicer, slicer } from "ponder:schema"
import { upsertPayees } from "@/utils"

ponder.on("SliceCore:TokenResliced", async ({ event, context: { db } }) => {
	const { tokenId: slicerId, accounts, tokensDiffs } = event.args

	const promisePayees = upsertPayees(db, accounts as `0x${string}`[])

	let totalDiff = 0n
	const promisePayeeSlicers = accounts.map((address, index) => {
		const tokenDiff = BigInt(tokensDiffs[index] ?? 0)

		totalDiff += tokenDiff

		return db
			.insert(payeeSlicer)
			.values({
				payeeId: address,
				slicerId: Number(slicerId),
				slices: tokenDiff,
				transfersAllowedWhileLocked: false
			})
			.onConflictDoUpdate((row) => ({
				slices: row.slices + tokenDiff
			}))
	})

	const promiseSlicer = db
		.update(slicer, { id: Number(slicerId) })
		.set((row) => ({ slices: row.slices + totalDiff }))

	await Promise.all([
		promiseSlicer,
		promisePayees,
		...promisePayeeSlicers,
		promiseSlicer
	])
})
