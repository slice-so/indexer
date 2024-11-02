import { ponder } from "@/generated"

ponder.on(
  "ProductsModule:ProductRemoved",
  async ({ event: { args }, context: { db } }) => {
    const { slicerId, productId } = args

    await db.Product.update({
      id: `${slicerId}-${productId}`,
      data: {
        isRemoved: true,
        isFree: false,
        isInfinite: false,
        availableUnits: 0n,
        maxUnitsPerBuyer: 0,
        referralFeeProduct: 0n,
        data: "0x",
        extAddress: undefined,
        extValue: undefined,
        extCheckSig: undefined,
        extExecSig: undefined,
        extData: undefined
      }
    })
  }
)
