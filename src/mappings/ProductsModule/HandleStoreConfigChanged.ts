import { ponder } from "ponder:registry"
import { slicer } from "ponder:schema"

ponder.on(
	"ProductsModule:StoreConfigChanged",
	async ({ event: { args }, context: { db } }) => {
		const { slicerId, isStoreClosed, referralFeeStore } = args

		await db
			.update(slicer, {
				id: Number(slicerId)
			})
			.set({
				storeClosed: isStoreClosed,
				referralFeeStore
			})
	}
)
