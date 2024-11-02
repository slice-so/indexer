import { ponder } from "@/generated"

ponder.on(
  "ProductsModule:StoreConfigChanged",
  async ({ event: { args }, context: { db } }) => {
    const { slicerId, isStoreClosed, referralFeeStore } = args

    await db.Slicer.update({
      id: slicerId,
      data: { storeClosed: isStoreClosed, referralFeeStore }
    })
  }
)
