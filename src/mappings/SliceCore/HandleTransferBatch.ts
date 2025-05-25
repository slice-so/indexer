import { ponder } from "ponder:registry"
import { payeeSlicer } from "ponder:schema"
import { upsertPayee } from "@/utils"
import { zeroAddress } from "viem"

ponder.on("SliceCore:TransferBatch", async ({ event, context: { db } }) => {
  const { from, to, ids, values } = event.args

  if (from !== zeroAddress && to !== zeroAddress && from !== to) {
    const promisePayeeTo = upsertPayee(db, to)

    const promisePayeeSlicerFrom = ids.map((id, index) =>
      db
        .update(payeeSlicer, { payeeId: from, slicerId: Number(id) })
        .set((row) => ({
          slices: row.slices - (values[index] ?? 0n)
        }))
    )

    const promisePayeeSlicerTo = ids.map((id, index) =>
      db
        .insert(payeeSlicer)
        .values({
          payeeId: to,
          slicerId: Number(id),
          slices: values[index] ?? 0n,
          transfersAllowedWhileLocked: false
        })
        .onConflictDoUpdate((row) => ({
          slices: row.slices + (values[index] ?? 0n)
        }))
    )

    await Promise.all([
      promisePayeeTo,
      ...promisePayeeSlicerFrom,
      ...promisePayeeSlicerTo
    ])
  }
})
