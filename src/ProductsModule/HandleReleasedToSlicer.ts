import { ponder } from "@/generated"

ponder.on(
  "ProductsModule:ReleasedToSlicer",
  async ({ event: { args }, context: { db } }) => {
    const { slicerId, ethToRelease } = args

    await db.Slicer.update({
      id: slicerId,
      data: ({ current }) => ({
        productsModuleBalance: 1n,
        productsModuleReleased: current.productsModuleReleased + ethToRelease
      })
    })
  }
)
