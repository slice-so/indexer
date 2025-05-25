import { ponder } from "ponder:registry"
import { product } from "ponder:schema"

ponder.on(
  "ProductsModule:ProductRemoved",
  async ({ event: { args }, context: { db } }) => {
    const { slicerId, productId } = args

    await db
      .update(product, {
        slicerId: Number(slicerId),
        id: Number(productId)
      })
      .set({
        isRemoved: true,
        isFree: false,
        isInfinite: false,
        availableUnits: 0n,
        maxUnitsPerBuyer: 0,
        referralFeeProduct: 0n,
        data: "0x"
      })
  }
)
