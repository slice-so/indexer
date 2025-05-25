import { ponder } from "ponder:registry"
import { slicer as slicerTable } from "ponder:schema"
import { upsertPayee } from "@/utils"

ponder.on(
  "SliceCore:SlicerControllerSet",
  async ({ event, context: { db } }) => {
    const { tokenId: slicerId, slicerController } = event.args

    const promisePayee = upsertPayee(db, slicerController)

    const promiseSlicer = db
      .update(slicerTable, { id: Number(slicerId) })
      .set((row) => ({
        royaltyReceiverId:
          row.royaltyReceiverId !== row.address
            ? slicerController
            : row.royaltyReceiverId,
        controllerId: slicerController
      }))

    await Promise.all([promisePayee, promiseSlicer])
  }
)
