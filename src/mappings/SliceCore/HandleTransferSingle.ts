import { ponder } from "ponder:registry"
import { payeeSlicer } from "ponder:schema"
import { upsertPayee } from "@/utils"
import { zeroAddress } from "viem"

ponder.on("SliceCore:TransferSingle", async ({ event, context: { db } }) => {
	const { from, to, id: slicerId, value } = event.args

	if (from !== zeroAddress && to !== zeroAddress && from !== to) {
		const promisePayeeTo = upsertPayee(db, to)

		const promisePayeeSlicerFrom = db
			.update(payeeSlicer, { payeeId: from, slicerId: Number(slicerId) })
			.set((row) => ({ slices: row.slices - value }))

		const promisePayeeSlicerTo = db
			.insert(payeeSlicer)
			.values({
				payeeId: to,
				slicerId: Number(slicerId),
				slices: value,
				transfersAllowedWhileLocked: false
			})
			.onConflictDoUpdate((row) => ({ slices: row.slices + value }))

		await Promise.all([
			promisePayeeTo,
			promisePayeeSlicerFrom,
			promisePayeeSlicerTo
		])
	}
})
