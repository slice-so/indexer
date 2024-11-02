import { Context, ponder } from "@/generated"
import { Address, zeroAddress } from "viem"

const handleProductAdded = async ({
  db,
  timestamp,
  slicerId,
  productId,
  categoryIndex,
  creator,
  params,
  externalCall
}: {
  db: Context["db"]
  timestamp: bigint
  slicerId: bigint
  productId: bigint
  categoryIndex: bigint
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
    purchaseData,
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

  const id = `${slicerId}-${productId}`

  const productPromise = db.Product.create({
    id,
    data: {
      isRemoved: false,
      isFree,
      isInfinite,
      availableUnits: isInfinite ? 0n : BigInt(availableUnits),
      maxUnitsPerBuyer,
      creator,
      data,
      createdAtTimestamp: timestamp,
      extAddress: externalAddress != zeroAddress ? externalAddress : undefined,
      extValue: externalAddress != zeroAddress ? value : undefined,
      extCheckSig:
        externalAddress != zeroAddress ? checkFunctionSignature : undefined,
      extExecSig:
        externalAddress != zeroAddress ? execFunctionSignature : undefined,
      extData: externalAddress != zeroAddress ? externalCallData : undefined,
      extRelativePrice: isExternalCallPaymentRelative,
      extPreferredToken: isExternalCallPreferredToken,
      totalPurchases: 0n,
      referralFeeProduct,
      slicerId,
      categoryId: categoryIndex
    }
  })

  const productRelationPromise = db.ProductRelation.createMany({
    data: subSlicerProducts.map(({ subSlicerId, subProductId }) => {
      const childProductId = `${subSlicerId}-${subProductId}`

      return {
        id: `${id}-${childProductId}`,
        parentProductId: id,
        childProductId
      }
    })
  })

  const productPricePromise = db.ProductPrice.createMany({
    data: currencyPrices.map(
      ({ value, dynamicPricing, externalAddress, currency }) => ({
        id: `${id}-${currency}`,
        productId: id,
        currencyId: currency,
        price: value,
        isPriceDynamic: dynamicPricing,
        externalAddress
      })
    )
  })

  const currencySlicerPromises = currencyPrices.map(({ currency }) => {
    return db.CurrencySlicer.upsert({
      id: `${currency}-${slicerId}`,
      create: {
        currencyId: currency,
        slicerId,
        released: 0n,
        releasedToProtocol: 0n,
        creatorFeePaid: 0n,
        referralFeePaid: 0n
      },
      update: {}
    })
  })

  await Promise.all([
    productPromise,
    productRelationPromise,
    productPricePromise,
    ...currencySlicerPromises
  ])
}

ponder.on(
  "ProductsModule:ProductAdded(uint256 indexed slicerId, uint256 indexed productId, uint256 indexed categoryIndex, address creator, ((uint128 subSlicerId, uint32 subProductId)[] subSlicerProducts, (uint248 value, bool dynamicPricing, address externalAddress, address currency)[] currencyPrices, bytes data, bytes purchaseData, uint32 availableUnits, uint8 maxUnitsPerBuyer, bool isFree, bool isInfinite, bool isExternalCallPaymentRelative, bool isExternalCallPreferredToken) params, (bytes data, uint256 value, address externalAddress, bytes4 checkFunctionSignature, bytes4 execFunctionSignature) externalCall)",
  async ({ event: { args, block }, context: { db } }) => {
    const {
      slicerId,
      productId,
      categoryIndex,
      creator,
      params,
      externalCall
    } = args

    await handleProductAdded({
      db,
      timestamp: block.timestamp,
      slicerId,
      productId,
      categoryIndex,
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
      categoryIndex,
      creator,
      params,
      externalCall
    } = args
    await handleProductAdded({
      db,
      timestamp: block.timestamp,
      slicerId,
      productId,
      categoryIndex,
      creator,
      params,
      externalCall
    })
  }
)
