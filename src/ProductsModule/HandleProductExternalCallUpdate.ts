import { ponder } from "@/generated"
import { zeroAddress } from "viem"

ponder.on(
  "ProductsModule:ProductExternalCallUpdated",
  async ({ event: { args }, context: { db } }) => {
    const { slicerId, productId, externalCall } = args
    const {
      data,
      value,
      externalAddress,
      checkFunctionSignature,
      execFunctionSignature
    } = externalCall
    const id = `${slicerId}-${productId}`

    await db.Product.update({
      id,
      data: {
        extAddress:
          externalAddress != zeroAddress ? externalAddress : undefined,
        extValue: externalAddress != zeroAddress ? value : undefined,
        extCheckSig:
          externalAddress != zeroAddress ? checkFunctionSignature : undefined,
        extExecSig:
          externalAddress != zeroAddress ? execFunctionSignature : undefined,
        extData: externalAddress != zeroAddress ? data : undefined
      }
    })
  }
)
