import { ponder } from "@/generated"
import { upsertPayee } from "@/utils/upsertPayee"

ponder.on("SliceCore:TokenResliced", async ({ event, context: { db } }) => {
  const { tokenId: slicerId, accounts, tokensDiffs } = event.args

  // Create any missing payee
  const promisePayees = accounts.map((address) => upsertPayee(db, address))

  let totalDiff = 0n
  const promisePayeeSlicers = accounts.map((address, index) => {
    const tokenDiff = BigInt(tokensDiffs[index]!)

    totalDiff += tokenDiff

    return db.PayeeSlicer.upsert({
      id: `${address}-${slicerId}`,
      create: {
        payeeId: address,
        slicerId,
        slices: tokenDiff,
        transfersAllowedWhileLocked: false
      },
      update: ({ current }) => ({
        slices: current.slices + tokenDiff
      })
    })
  })

  const promiseSlicer = db.Slicer.update({
    id: slicerId,
    data: ({ current }) => ({ slices: current.slices + totalDiff })
  })

  await Promise.all([
    promiseSlicer,
    ...promisePayees,
    ...promisePayeeSlicers,
    promiseSlicer
  ])
})
