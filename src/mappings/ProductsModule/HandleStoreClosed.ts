import { ponder } from "ponder:registry"
import { slicer } from "ponder:schema"

ponder.on(
	"ProductsModule:StoreClosed",
	async ({ event: { args }, context: { db } }) => {
		const { slicerId, isStoreClosed } = args

		await db
			.update(slicer, {
				id: Number(slicerId)
			})
			.set({
				storeClosed: isStoreClosed
			})
	}
)
