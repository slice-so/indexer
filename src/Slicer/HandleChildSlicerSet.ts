import { ponder } from "@/generated"
import { getSlicerId } from "@/utils/getSlicerId"

ponder.on("Slicer:ChildSlicerSet", async ({ event, context: { db } }) => {
  const { slicerId: childSlicerId, addChildSlicerMode: isAdded } = event.args
  const parentSlicerId = await getSlicerId(event.log.address, db)

  if (isAdded) {
    await db.SlicerRelation.upsert({
      id: `${parentSlicerId}-${childSlicerId}`,
      create: {
        parentSlicerId,
        childSlicerId
      },
      update: {
        parentSlicerId,
        childSlicerId
      }
    })
  } else {
    await db.SlicerRelation.delete({
      id: `${parentSlicerId}-${childSlicerId}`
    })
  }
})
