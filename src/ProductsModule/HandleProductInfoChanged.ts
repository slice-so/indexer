import { Context, ponder } from "@/generated"
import { Address } from "viem"

const handleProductInfoChanged = async ({
  db,
  timestamp,
  slicerId,
  productId,
  maxUnitsPerBuyer,
  isFree,
  isInfinite,
  newUnits,
  currencyPrices,
  referralFeeProduct = 0n
}: {
  db: Context["db"]
  timestamp: bigint
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
}) => {
  const id = `${slicerId}-${productId}`

  const productPromise = db.Product.update({
    id,
    data: {
      maxUnitsPerBuyer,
      isFree,
      isInfinite,
      availableUnits: isInfinite ? 0n : BigInt(newUnits),
      referralFeeProduct
    }
  })

  const productPricePromises = currencyPrices
    .map(({ value, dynamicPricing, externalAddress, currency }) => [
      db.ProductPrice.upsert({
        id: `${id}-${currency}`,
        create: {
          productId: id,
          currencyId: currency,
          price: value,
          isPriceDynamic: dynamicPricing,
          externalAddress
        },
        update: {
          price: value,
          isPriceDynamic: dynamicPricing,
          externalAddress
        }
      }),
      db.CurrencySlicer.upsert({
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
    ])
    .flat()

  await Promise.all([productPromise, ...productPricePromises])
}

ponder.on(
  "ProductsModule:ProductInfoChanged(uint256 indexed slicerId, uint256 indexed productId, uint8 maxUnitsPerBuyer, bool isFree, bool isInfinite, uint256 newUnits, (uint248 value, bool dynamicPricing, address externalAddress, address currency)[] currencyPrices)",
  async ({ event: { args, block }, context: { db } }) => {
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
      timestamp: block.timestamp,
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
  async ({ event: { args, block }, context: { db } }) => {
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
      timestamp: block.timestamp,
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
