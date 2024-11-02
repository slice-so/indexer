import { ponder } from "@/generated"
import { upsertPayee } from "@/utils/upsertPayee"
import { zeroAddress } from "viem"

ponder.on("SliceCore:TransferBatch", async ({ event, context: { db } }) => {
  const { from, to, ids, values } = event.args

  if (from !== zeroAddress && to !== zeroAddress && from !== to) {
    const promisePayeeTo = upsertPayee(db, to)

    const promisePayeeSlicerFrom = ids.map((id, index) =>
      db.PayeeSlicer.update({
        id: `${from}-${id}`,
        data: ({ current }) => ({ slices: current.slices - values[index]! })
      })
    )

    const promisePayeeSlicerTo = ids.map((id, index) =>
      db.PayeeSlicer.upsert({
        id: `${to}-${id}`,
        create: {
          payeeId: to,
          slicerId: id,
          slices: values[index]!,
          transfersAllowedWhileLocked: false
        },
        update: ({ current }) => ({ slices: current.slices + values[index]! })
      })
    )

    await Promise.all([
      promisePayeeTo,
      ...promisePayeeSlicerFrom,
      ...promisePayeeSlicerTo
    ])
  }
})
