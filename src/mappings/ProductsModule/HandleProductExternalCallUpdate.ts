import { ponder } from "ponder:registry"
import { product } from "ponder:schema"
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

		await db
			.update(product, { slicerId: Number(slicerId), id: Number(productId) })
			.set({
				extAddress:
					externalAddress !== zeroAddress ? externalAddress : undefined,
				extValue: externalAddress !== zeroAddress ? value : undefined,
				extCheckSig:
					externalAddress !== zeroAddress ? checkFunctionSignature : undefined,
				extExecSig:
					externalAddress !== zeroAddress ? execFunctionSignature : undefined,
				extData: externalAddress !== zeroAddress ? data : undefined
			})
	}
)
