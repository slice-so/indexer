import { ponder } from "ponder:registry"
import { slicer } from "@/schema/tables"
import { defaultRoyaltyPercentage } from "@/utils"
import { zeroAddress } from "viem"

ponder.on("SliceCore:RoyaltySet", async ({ event, context: { db } }) => {
	const {
		tokenId: slicerId,
		isSlicer,
		isActive,
		royaltyPercentage
	} = event.args

	await db.update(slicer, { id: Number(slicerId) }).set((row) => ({
		royaltyPercentage: isActive
			? Number(royaltyPercentage)
			: defaultRoyaltyPercentage,
		royaltyReceiverId: isSlicer
			? row.address
			: row.controllerId !== zeroAddress
				? row.controllerId
				: row.creatorId
	}))
})
