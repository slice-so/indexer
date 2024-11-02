import { Context, ponder } from "@/generated"
import { Transaction } from "@ponder/core"
import { Address, zeroAddress } from "viem"

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

ponder.on(
  "ProductsModule:ProductPaid(uint256 indexed slicerId, uint256 indexed productId, uint256 quantity, address indexed buyer, address currency, (uint256 eth, uint256 currency, uint256 ethExternalCall, uint256 currencyExternalCall) price)",
  async ({ event: { args, block, transaction }, context: { db } }) => {
    const { slicerId, productId, quantity, buyer, currency, price } = args

    await handleProductPaid({
      db,
      transaction,
      timestamp: block.timestamp,
      slicerId,
      productId,
      quantity,
      buyer,
      currency,
      price
    })
  }
)

ponder.on(
  "ProductsModule:ProductPaid(uint256 indexed slicerId, uint256 indexed productId, uint256 quantity, address indexed buyer, address currency, (uint256 eth, uint256 currency, uint256 ethExternalCall, uint256 currencyExternalCall) price, address referrer, uint256 parentSlicerId, uint256 parentProductId)",
  async ({ event: { args, block, transaction }, context: { db } }) => {
    const {
      slicerId,
      productId,
      quantity,
      buyer,
      currency,
      price,
      referrer,
      parentSlicerId,
      parentProductId
    } = args

    await handleProductPaid({
      db,
      transaction,
      timestamp: block.timestamp,
      slicerId,
      productId,
      quantity,
      buyer,
      currency,
      price,
      referrer,
      parentSlicerId,
      parentProductId
    })
  }
)

const handleProductPaid = async ({
  db,
  transaction,
  timestamp,
  slicerId,
  productId,
  quantity,
  buyer,
  currency,
  price,
  referrer = zeroAddress,
  parentSlicerId = undefined,
  parentProductId = undefined
}: {
  db: Context["db"]
  transaction: Transaction
  timestamp: bigint
  slicerId: bigint
  productId: bigint
  quantity: bigint
  buyer: Address
  currency: Address
  price: {
    eth: bigint
    currency: bigint
    ethExternalCall: bigint
    currencyExternalCall: bigint
  }
  referrer?: Address
  parentSlicerId?: bigint
  parentProductId?: bigint
}) => {
  const totalPaymentEth = price.eth + price.ethExternalCall
  const totalPaymentCurrency = price.currency + price.currencyExternalCall

  const promises = []

  // use await as I need it for other queries
  const product = await db.Product.update({
    id: `${slicerId}-${productId}`,
    data: ({ current }) => ({
      totalPurchases: current.totalPurchases + quantity,
      availableUnits: current.isInfinite
        ? current.availableUnits
        : current.availableUnits - quantity
    })
  })

  promises.push(
    db.Payee.upsert({
      id: transaction.from
    })
  )
  promises.push(
    db.Payee.upsert({
      id: buyer
    })
  )

  promises.push(
    db.PayeeSlicer.upsert({
      id: `${buyer}-${slicerId}`,
      create: {
        payeeId: buyer,
        slicerId,
        slices: 0n,
        transfersAllowedWhileLocked: false
      },
      update: {}
    })
  )

  if (totalPaymentEth != 0n) {
    promises.push(
      updatePayeeCurrency({
        db,
        slicerId,
        buyer,
        currency: zeroAddress,
        amount: totalPaymentEth
      })
    )
  }

  if (totalPaymentCurrency != 0n) {
    promises.push(
      updatePayeeCurrency({
        db,
        slicerId,
        buyer,
        currency,
        amount: totalPaymentCurrency
      })
    )
  }

  let referralFee = 0n
  if (referrer != zeroAddress) {
    promises.push(
      db.Payee.upsert({
        id: referrer
      })
    )

    const referralAmount = getReferralAmount(
      currency === zeroAddress ? price.eth : price.currency,
      referralFee
    )

    promises.push(
      db.PayeeCurrency.upsert({
        id: `${referrer}-${currency}`,
        create: {
          payeeId: referrer,
          currencyId: currency,
          toWithdraw: 0n,
          toPayToProtocol: 0n,
          withdrawn: 0n,
          paidToProtocol: 0n,
          totalCreatorFees: 0n,
          totalReferralFees: referralAmount
        },
        update: ({ current }) => ({
          totalReferralFees: current.totalReferralFees + referralAmount
        })
      })
    )

    referralFee = product.referralFeeProduct

    if (referralFee == 0n) {
      const slicer = await db.Slicer.findUnique({
        id: slicerId
      })
      referralFee = slicer!.referralFeeStore || 0n
    }
  }

  const referralEth = getReferralAmount(price.eth, referralFee)
  const referralCurrency = getReferralAmount(price.currency, referralFee)

  promises.push(
    db.Order.upsert({
      id: transaction.hash,
      create: {
        timestamp,
        totalPaymentEth,
        totalPaymentCurrency,
        totalReferralEth: referralEth,
        totalReferralCurrency: referralCurrency,
        payerId: transaction.from,
        buyerId: buyer,
        referrerId: referrer
      },
      update: ({ current }) => ({
        totalPaymentEth: current.totalPaymentEth + totalPaymentEth,
        totalPaymentCurrency:
          current.totalPaymentCurrency + totalPaymentCurrency,
        totalReferralEth: current.totalReferralEth + referralEth,
        totalReferralCurrency: current.totalReferralCurrency + referralCurrency
      })
    })
  )

  promises.push(
    db.OrderSlicer.upsert({
      id: `${transaction.hash}-${slicerId}`,
      create: {
        orderId: transaction.hash,
        slicerId,
        buyerSlicerId: `${buyer}-${slicerId}`
      },
      update: {}
    })
  )

  promises.push(
    db.OrderProduct.upsert({
      id: `${transaction.hash}-${slicerId}-${productId}`,
      create: {
        orderId: transaction.hash,
        productId: `${slicerId}-${productId}`,
        quantity,
        paymentEth: price.eth,
        paymentCurrency: price.currency,
        externalPaymentEth: price.ethExternalCall,
        externalPaymentCurrency: price.currencyExternalCall,
        referralEth,
        referralCurrency,
        orderSlicerId: `${transaction.hash}-${slicerId}`,
        currencyId: currency
      },
      update: ({ current }) => ({
        quantity: current.quantity + quantity,
        paymentEth: current.paymentEth + price.eth,
        paymentCurrency: current.paymentCurrency + price.currency,
        externalPaymentEth: current.externalPaymentEth + price.ethExternalCall,
        externalPaymentCurrency:
          current.externalPaymentCurrency + price.currencyExternalCall,
        referralEth: current.referralEth + referralEth,
        referralCurrency: current.referralCurrency + referralCurrency
      })
    })
  )

  if (parentSlicerId != undefined && parentProductId != undefined) {
    promises.push(
      db.OrderProductRelation.create({
        id: `${transaction.hash}-${parentSlicerId}-${parentProductId}`,
        data: {
          orderParentProductId: `${transaction.hash}-${slicerId}-${productId}`,
          orderSubProductId: `${transaction.hash}-${parentSlicerId}-${parentProductId}`
        }
      })
    )
  }

  await Promise.all(promises)
}

const getReferralAmount = (amount: bigint, referralFee: bigint) =>
  referralFee !== 0n ? (amount * referralFee) / 10_000n : 0n

const updatePayeeCurrency = async ({
  db,
  slicerId,
  buyer,
  currency,
  amount
}: {
  db: Context["db"]
  slicerId: bigint
  buyer: Address
  currency: Address
  amount: bigint
}) => {
  const buyerSlicerCurrencyPromise = db.PayeeSlicerCurrency.upsert({
    id: `${buyer}-${slicerId}-${currency}`,
    create: {
      payeeSlicerId: `${buyer}-${slicerId}`,
      currencySlicerId: `${currency}-${slicerId}`,
      payeeCurrencyId: `${buyer}-${currency}`,
      paidForProducts: amount
    },
    update: ({ current }) => ({
      paidForProducts: current.paidForProducts + amount
    })
  })

  const buyerCurrencyPromise = db.PayeeCurrency.upsert({
    id: `${buyer}-${currency}`,
    create: {
      payeeId: buyer,
      currencyId: currency,
      toWithdraw: 0n,
      toPayToProtocol: 0n,
      withdrawn: 0n,
      paidToProtocol: 0n,
      totalCreatorFees: 0n,
      totalReferralFees: 0n
    },
    update: {}
  })

  return Promise.all([buyerSlicerCurrencyPromise, buyerCurrencyPromise])
}

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

ponder.on(
  "ProductsModule:StoreClosed",
  async ({ event: { args }, context: { db } }) => {
    const { slicerId, isStoreClosed } = args

    await db.Slicer.update({
      id: slicerId,
      data: { storeClosed: isStoreClosed }
    })
  }
)

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

ponder.on(
  "ProductsModule:ExtraCostPaid",
  async ({ event: { args, block, transaction }, context: { db } }) => {
    const { currency, amount, description, recipient } = args
    const id = `${transaction.hash}-${currency}-${recipient}-${description}`

    const { items: slicer } = await db.Slicer.findMany({
      where: {
        address: recipient
      },
      limit: 1
    })
    const slicerId = slicer[0]?.id

    const extraCostPromise = db.ExtraCost.upsert({
      id,
      create: {
        amount,
        description,
        recipient: slicerId != undefined ? undefined : recipient,
        slicerId: slicerId != undefined ? slicerId : undefined,
        orderId: transaction.hash,
        currencyId: currency
      },
      update: ({ current }) => ({
        amount: current.amount + amount
      })
    })

    const payeePromise = db.Payee.upsert({
      id: transaction.from
    })

    // edge case: if the order is created in this event, it means no products were purchased.
    const orderPromise = db.Order.upsert({
      id: transaction.hash,
      create: {
        timestamp: block.timestamp,
        totalPaymentEth: 0n,
        totalPaymentCurrency: 0n,
        totalReferralEth: 0n,
        totalReferralCurrency: 0n,
        payerId: transaction.from,
        buyerId: zeroAddress,
        referrerId: zeroAddress
      },
      update: {}
    })

    await Promise.all([extraCostPromise, payeePromise, orderPromise])
  }
)

ponder.on(
  "ProductsModule:StoreConfigChanged",
  async ({ event: { args }, context: { db } }) => {
    const { slicerId, isStoreClosed, referralFeeStore } = args

    await db.Slicer.update({
      id: slicerId,
      data: { storeClosed: isStoreClosed, referralFeeStore }
    })
  }
)

ponder.on(
  "ProductsModule:PurchaseMade",
  async ({ event: { args, transaction }, context: { db } }) => {
    const { buyer } = args

    let buyerId: Address = zeroAddress

    await db.Order.update({
      id: transaction.hash,
      data: ({ current }) => {
        buyerId = current.buyerId === zeroAddress ? buyer : current.buyerId
        return {
          buyerId
        }
      }
    })

    if (buyerId !== zeroAddress) {
      await db.Payee.upsert({
        id: buyerId
      })
    }
  }
)

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
