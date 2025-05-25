import { ponder } from "ponder:registry"
import { slicer } from "ponder:schema"

ponder.on(
  "ProductsModule:ReleasedToSlicer",
  async ({ event: { args }, context: { db } }) => {
    const { slicerId, ethToRelease } = args

    await db
      .update(slicer, {
        id: Number(slicerId)
      })
      .set((row) => ({
        productsModuleBalance: 1n,
        productsModuleReleased: row.productsModuleReleased + ethToRelease
      }))
  }
)
