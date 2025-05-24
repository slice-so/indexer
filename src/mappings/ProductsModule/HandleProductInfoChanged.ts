import { type Context, ponder } from "ponder:registry"
import { currencySlicer, product, productPrice } from "ponder:schema"
import type { Address } from "viem"

const handleProductInfoChanged = async ({
	db,
	slicerId,
	productId,
	maxUnitsPerBuyer,
	isFree,
	isInfinite,
	newUnits,
	currencyPrices,
	referralFeeProduct = 0n,
	categoryId = 0n,
	productTypeId = 0n
}: {
	db: Context["db"]
	slicerId: bigint
	productId: bigint
	maxUnitsPerBuyer: number
	isFree: boolean
	isInfinite: boolean
	newUnits: bigint
	currencyPrices: readonly {
		value: bigint
		dynamicPricing: boolean
		externalAddress: Address
		currency: Address
	}[]
	referralFeeProduct?: bigint
	categoryId?: bigint
	productTypeId?: bigint
}) => {
	const productPromise = db
		.update(product, { slicerId: Number(slicerId), id: Number(productId) })
		.set({
			maxUnitsPerBuyer,
			isFree,
			isInfinite,
			availableUnits: isInfinite ? 0n : BigInt(newUnits),
			referralFeeProduct,
			categoryId: Number(categoryId),
			productTypeId: Number(productTypeId)
		})

	const productPricePromises = currencyPrices.map(
		({ value, dynamicPricing: isPriceDynamic, externalAddress, currency }) =>
			db
				.insert(productPrice)
				.values({
					slicerId: Number(slicerId),
					productId: Number(productId),
					currencyId: currency,
					price: value,
					isPriceDynamic,
					externalAddress
				})
				.onConflictDoUpdate({
					price: value,
					isPriceDynamic,
					externalAddress
				})
	)

	const currencySlicerPromise = db
		.insert(currencySlicer)
		.values(
			currencyPrices.map(({ currency }) => ({
				currencyId: currency,
				slicerId: Number(slicerId),
				released: 0n,
				releasedToProtocol: 0n,
				creatorFeePaid: 0n,
				referralFeePaid: 0n,
				releasedUsd: 0n,
				totalEarned: 0n
			}))
		)
		.onConflictDoNothing()

	await Promise.all([
		productPromise,
		...productPricePromises,
		currencySlicerPromise
	])
}

ponder.on(
	"ProductsModule:ProductInfoChanged(uint256 indexed slicerId, uint256 indexed productId, uint8 maxUnitsPerBuyer, bool isFree, bool isInfinite, uint256 newUnits, (uint248 value, bool dynamicPricing, address externalAddress, address currency)[] currencyPrices)",
	async ({ event: { args }, context: { db } }) => {
		const {
			slicerId,
			productId,
			maxUnitsPerBuyer,
			isFree,
			isInfinite,
			newUnits,
			currencyPrices
		} = args
		await handleProductInfoChanged({
			db,
			slicerId,
			productId,
			maxUnitsPerBuyer,
			isFree,
			isInfinite,
			newUnits,
			currencyPrices
		})
	}
)

ponder.on(
	"ProductsModule:ProductInfoChanged(uint256 indexed slicerId, uint256 indexed productId, uint8 maxUnitsPerBuyer, bool isFree, bool isInfinite, uint256 newUnits, (uint248 value, bool dynamicPricing, address externalAddress, address currency)[] currencyPrices, uint256 referralFeeProduct)",
	async ({ event: { args }, context: { db } }) => {
		const {
			slicerId,
			productId,
			maxUnitsPerBuyer,
			isFree,
			isInfinite,
			newUnits,
			currencyPrices,
			referralFeeProduct
		} = args
		await handleProductInfoChanged({
			db,
			slicerId,
			productId,
			maxUnitsPerBuyer,
			isFree,
			isInfinite,
			newUnits,
			currencyPrices,
			referralFeeProduct
		})
	}
)

ponder.on(
	"ProductsModule:ProductInfoChanged((uint256 slicerId, uint256 productId, uint8 newMaxUnits, bool isFree, bool isInfinite, uint32 newUnits, uint256 referralFeeProduct, uint256 categoryId, uint256 productTypeId) params, uint256 newUnits, (uint248 value, bool dynamicPricing, address externalAddress, address currency)[] currencyPrices)",
	async ({ event: { args }, context: { db } }) => {
		const { params, newUnits, currencyPrices } = args
		const {
			slicerId,
			productId,
			newMaxUnits,
			isFree,
			isInfinite,
			referralFeeProduct,
			categoryId,
			productTypeId
		} = params
		await handleProductInfoChanged({
			db,
			slicerId,
			productId,
			maxUnitsPerBuyer: newMaxUnits,
			isFree,
			isInfinite,
			newUnits,
			currencyPrices,
			referralFeeProduct,
			categoryId,
			productTypeId
		})
	}
)
