import { Context, ponder } from "@/generated"
import { upsertPayee } from "@/utils/upsertPayee"
import { Transaction } from "@ponder/core"
import { Address, zeroAddress } from "viem"

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

  promises.push(upsertPayee(db, transaction.from))

  promises.push(upsertPayee(db, buyer))

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
    promises.push(upsertPayee(db, referrer))

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
      db.OrderProductRelation.upsert({
        id: `${transaction.hash}-${parentSlicerId}-${parentProductId}-${slicerId}-${productId}`,
        create: {
          orderParentProductId: `${transaction.hash}-${parentSlicerId}-${parentProductId}`,
          orderSubProductId: `${transaction.hash}-${slicerId}-${productId}`
        },
        update: {}
      })
    )
  }

  await Promise.all(promises)
}

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

const getReferralAmount = (amount: bigint, referralFee: bigint) =>
  referralFee !== 0n ? (amount * referralFee) / 10_000n : 0n

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
