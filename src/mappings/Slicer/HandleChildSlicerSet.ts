import { ponder } from "ponder:registry"
import { slicerRelation } from "@/schema/tables"
import { getSlicerId } from "@/utils"

ponder.on("Slicer:ChildSlicerSet", async ({ event, context: { db } }) => {
	const { slicerId: childSlicerId, addChildSlicerMode: isAdded } = event.args
	const parentSlicerId = await getSlicerId(event.log.address, db)

	if (isAdded) {
		await db
			.insert(slicerRelation)
			.values({
				parentSlicerId: parentSlicerId,
				childSlicerId: Number(childSlicerId)
			})
			.onConflictDoUpdate({
				parentSlicerId: parentSlicerId,
				childSlicerId: Number(childSlicerId)
			})
	} else {
		await db.delete(slicerRelation, {
			parentSlicerId: parentSlicerId,
			childSlicerId: Number(childSlicerId)
		})
	}
})
