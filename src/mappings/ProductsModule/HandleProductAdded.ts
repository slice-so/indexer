import { type Context, ponder } from "ponder:registry"
import {
	currencySlicer,
	product,
	productPrice,
	productRelation
} from "ponder:schema"
import { type Address, zeroAddress } from "viem"

const handleProductAdded = async ({
	db,
	timestamp,
	slicerId,
	productId,
	categoryId = 0n,
	productTypeId = 0n,
	creator,
	params,
	externalCall
}: {
	db: Context["db"]
	timestamp: bigint
	slicerId: bigint
	productId: bigint
	categoryId?: bigint
	productTypeId?: bigint
	creator: Address
	params: {
		subSlicerProducts: readonly { subSlicerId: bigint; subProductId: number }[]
		currencyPrices: readonly {
			value: bigint
			dynamicPricing: boolean
			externalAddress: Address
			currency: Address
		}[]
		data: Address
		purchaseData: Address
		availableUnits: number
		maxUnitsPerBuyer: number
		isFree: boolean
		isInfinite: boolean
		isExternalCallPaymentRelative: boolean
		isExternalCallPreferredToken: boolean
		referralFeeProduct?: bigint
	}
	externalCall: {
		data: Address
		value: bigint
		externalAddress: Address
		checkFunctionSignature: Address
		execFunctionSignature: Address
	}
}) => {
	const {
		subSlicerProducts,
		currencyPrices,
		data,
		// purchaseData,
		availableUnits,
		maxUnitsPerBuyer,
		isFree,
		isInfinite,
		isExternalCallPaymentRelative,
		isExternalCallPreferredToken,
		referralFeeProduct = 0n
	} = params
	const {
		data: externalCallData,
		value,
		externalAddress,
		checkFunctionSignature,
		execFunctionSignature
	} = externalCall

	const productPromise = db.insert(product).values({
		id: Number(productId),
		slicerId: Number(slicerId),
		isRemoved: false,
		isFree,
		isInfinite,
		availableUnits: isInfinite ? 0n : BigInt(availableUnits),
		maxUnitsPerBuyer,
		creatorId: creator,
		data,
		createdAtTimestamp: timestamp,
		extAddress: externalAddress !== zeroAddress ? externalAddress : undefined,
		extValue: externalAddress !== zeroAddress ? value : undefined,
		extCheckSig:
			externalAddress !== zeroAddress ? checkFunctionSignature : undefined,
		extExecSig:
			externalAddress !== zeroAddress ? execFunctionSignature : undefined,
		extData: externalAddress !== zeroAddress ? externalCallData : undefined,
		extRelativePrice: isExternalCallPaymentRelative,
		extPreferredToken: isExternalCallPreferredToken,
		totalPurchases: 0n,
		referralFeeProduct,
		categoryId: Number(categoryId),
		productTypeId: Number(productTypeId)
	})

	const productRelationPromise = db.insert(productRelation).values(
		subSlicerProducts.map(({ subSlicerId, subProductId }) => ({
			parentSlicerId: Number(slicerId),
			parentProductId: Number(productId),
			childSlicerId: Number(subSlicerId),
			childProductId: Number(subProductId)
		}))
	)

	const productPricePromise = db.insert(productPrice).values(
		currencyPrices.map(
			({
				value,
				dynamicPricing: isPriceDynamic,
				externalAddress,
				currency
			}) => ({
				slicerId: Number(slicerId),
				productId: Number(productId),
				currencyId: currency,
				price: value,
				isPriceDynamic,
				externalAddress
			})
		)
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
		productRelationPromise,
		productPricePromise,
		currencySlicerPromise
	])
}

ponder.on(
	"ProductsModule:ProductAdded(uint256 indexed slicerId, uint256 indexed productId, uint256 indexed categoryIndex, address creator, ((uint128 subSlicerId, uint32 subProductId)[] subSlicerProducts, (uint248 value, bool dynamicPricing, address externalAddress, address currency)[] currencyPrices, bytes data, bytes purchaseData, uint32 availableUnits, uint8 maxUnitsPerBuyer, bool isFree, bool isInfinite, bool isExternalCallPaymentRelative, bool isExternalCallPreferredToken) params, (bytes data, uint256 value, address externalAddress, bytes4 checkFunctionSignature, bytes4 execFunctionSignature) externalCall)",
	async ({ event: { args, block }, context: { db } }) => {
		const {
			slicerId,
			productId,
			categoryIndex: categoryId,
			creator,
			params,
			externalCall
		} = args

		await handleProductAdded({
			db,
			timestamp: block.timestamp,
			slicerId,
			productId,
			categoryId,
			creator,
			params,
			externalCall
		})
	}
)

ponder.on(
	"ProductsModule:ProductAdded(uint256 indexed slicerId, uint256 indexed productId, uint256 indexed categoryIndex, address creator, ((uint128 subSlicerId, uint32 subProductId)[] subSlicerProducts, (uint248 value, bool dynamicPricing, address externalAddress, address currency)[] currencyPrices, bytes data, bytes purchaseData, uint32 availableUnits, uint8 maxUnitsPerBuyer, bool isFree, bool isInfinite, bool isExternalCallPaymentRelative, bool isExternalCallPreferredToken, uint256 referralFeeProduct) params, (bytes data, uint256 value, address externalAddress, bytes4 checkFunctionSignature, bytes4 execFunctionSignature) externalCall)",
	async ({ event: { args, block }, context: { db } }) => {
		const {
			slicerId,
			productId,
			categoryIndex: categoryId,
			creator,
			params,
			externalCall
		} = args
		await handleProductAdded({
			db,
			timestamp: block.timestamp,
			slicerId,
			productId,
			categoryId,
			creator,
			params,
			externalCall
		})
	}
)

ponder.on(
	"ProductsModule:ProductAdded(uint256 indexed slicerId, uint256 indexed productId, address creator, ((uint128 subSlicerId, uint32 subProductId)[] subSlicerProducts, (uint248 value, bool dynamicPricing, address externalAddress, address currency)[] currencyPrices, bytes data, bytes purchaseData, uint32 availableUnits, uint16 categoryId, uint16 productTypeId, uint8 maxUnitsPerBuyer, bool isFree, bool isInfinite, bool isExternalCallPaymentRelative, bool isExternalCallPreferredToken, uint256 referralFeeProduct) params, (bytes data, uint256 value, address externalAddress, bytes4 checkFunctionSignature, bytes4 execFunctionSignature) externalCall)",
	async ({ event: { args, block }, context: { db } }) => {
		const { slicerId, productId, creator, params, externalCall } = args
		const { categoryId, productTypeId } = params

		await handleProductAdded({
			db,
			timestamp: block.timestamp,
			slicerId,
			productId,
			categoryId: BigInt(categoryId),
			productTypeId: BigInt(productTypeId),
			creator,
			params,
			externalCall
		})
	}
)
