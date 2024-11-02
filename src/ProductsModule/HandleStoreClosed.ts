import { ponder } from "@/generated"

ponder.on(
  "ProductsModule:StoreClosed",
  async ({ event: { args }, context: { db } }) => {
    const { slicerId, isStoreClosed } = args

    await db.Slicer.update({
      id: slicerId,
      data: { storeClosed: isStoreClosed }
    })
  }
)
