import { ponder } from "@/generated"
import { upsertPayee } from "@/utils/upsertPayee"

ponder.on(
  "SliceCore:SlicerControllerSet",
  async ({ event, context: { db } }) => {
    const { tokenId: slicerId, slicerController } = event.args

    const promisePayee = upsertPayee(db, slicerController)

    const promiseSlicer = db.Slicer.update({
      id: slicerId,
      data: ({ current }) => ({
        royaltyReceiverId:
          current.royaltyReceiverId !== current.address
            ? slicerController
            : current.royaltyReceiverId,
        controllerId: slicerController
      })
    })

    await Promise.all([promisePayee, promiseSlicer])
  }
)
