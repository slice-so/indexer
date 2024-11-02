import { ponder } from "@/generated"
import { upsertPayee } from "@/utils/upsertPayee"
import { zeroAddress } from "viem"

ponder.on("SliceCore:TransferSingle", async ({ event, context: { db } }) => {
  const { from, to, id: slicerId, value } = event.args

  if (from !== zeroAddress && to !== zeroAddress && from !== to) {
    const promisePayeeTo = upsertPayee(db, to)

    const promisePayeeSlicerFrom = db.PayeeSlicer.update({
      id: `${from}-${slicerId}`,
      data: ({ current }) => ({ slices: current.slices - value })
    })

    const promisePayeeSlicerTo = db.PayeeSlicer.upsert({
      id: `${to}-${slicerId}`,
      create: {
        payeeId: to,
        slicerId,
        slices: value,
        transfersAllowedWhileLocked: false
      },
      update: ({ current }) => ({ slices: current.slices + value })
    })

    await Promise.all([
      promisePayeeTo,
      promisePayeeSlicerFrom,
      promisePayeeSlicerTo
    ])
  }
})
