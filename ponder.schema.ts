import { createSchema } from "@ponder/core"

export default createSchema((p) => ({
  Slicer: p.createTable({
    id: p.bigint(),

    // Values
    slicerVersion: p.bigint(),
    address: p.hex(),
    slices: p.bigint(),
    minimumSlices: p.bigint(),
    createdAtTimestamp: p.bigint(),
    releaseTimelock: p.bigint(),
    transferableTimelock: p.int(),
    protocolFee: p.int(),
    royaltyPercentage: p.int(),
    productsModuleBalance: p.bigint(),
    productsModuleReleased: p.bigint(),
    referralFeeStore: p.bigint(),
    isImmutable: p.boolean(),
    currenciesControlled: p.boolean(),
    productsControlled: p.boolean(),
    resliceAllowed: p.boolean(),
    transferWhileControlledAllowed: p.boolean(),
    acceptsAllCurrencies: p.boolean(),
    storeClosed: p.boolean(),

    // Relations
    creatorId: p.hex().references("Payee.id"),
    creator: p.one("creatorId"),

    controllerId: p.hex().references("Payee.id"),
    controller: p.one("controllerId"),

    royaltyReceiverId: p.hex().references("Payee.id"),
    royaltyReceiver: p.one("royaltyReceiverId"),

    payees: p.many("PayeeSlicer.slicerId"),
    products: p.many("Product.slicerId"),
    acceptedCurrencies: p.many("CurrencySlicer.slicerId"),
    childrenSlicers: p.many("SlicerRelation.parentSlicerId"),
    parentSlicers: p.many("SlicerRelation.childSlicerId"),
    purchaseData: p.many("PurchaseData.slicerId")
  }),

  SlicerRelation: p.createTable({
    id: p.string(),
    parentSlicerId: p.bigint().references("Slicer.id"),
    parentSlicer: p.one("parentSlicerId"),
    childSlicerId: p.bigint().references("Slicer.id"),
    childSlicer: p.one("childSlicerId")
  }),

  Payee: p.createTable({
    id: p.hex(),

    // Relations
    slicersOwned: p.many("PayeeSlicer.payeeId"),
    slicersCreated: p.many("Slicer.creatorId"),
    slicersControlled: p.many("Slicer.controllerId"),
    slicersRoyaltyReceiver: p.many("Slicer.royaltyReceiverId"),
    currencies: p.many("PayeeCurrency.payeeId"),
    purchases: p.many("ProductPurchase.buyerId"),
    ordersMade: p.many("Order.buyerId"),
    ordersPaid: p.many("Order.payerId"),
    ordersReferred: p.many("Order.referrerId")
  }),

  PayeeSlicer: p.createTable({
    id: p.string(),
    payeeId: p.hex().references("Payee.id"),
    payee: p.one("payeeId"),
    slicerId: p.bigint().references("Slicer.id"),
    slicer: p.one("slicerId"),

    // Values
    slices: p.bigint(),
    transfersAllowedWhileLocked: p.boolean(),

    // Relations
    currencyPayments: p.many("PayeeSlicerCurrency.payeeSlicerId"),
    purchases: p.many("ProductPurchase.buyerSlicerId")
  }),

  Currency: p.createTable({
    id: p.hex(),

    // Relations
    slicers: p.many("CurrencySlicer.currencyId"),
    payees: p.many("PayeeCurrency.currencyId"),
    products: p.many("ProductPrices.currencyId")
  }),

  CurrencySlicer: p.createTable({
    id: p.string(),
    currencyId: p.hex().references("Currency.id"),
    currency: p.one("currencyId"),
    slicerId: p.bigint().references("Slicer.id"),
    slicer: p.one("slicerId"),

    // Values
    released: p.bigint(),
    releasedToProtocol: p.bigint(),
    creatorFeePaid: p.bigint(),
    referralFeePaid: p.bigint(),

    // Relations
    payeePayments: p.many("PayeeSlicerCurrency.currencySlicerId"),
    releaseEvents: p.many("ReleaseEvent.currencySlicerId"),
    purchases: p.many("ProductPurchase.currencySlicerId")
  }),

  PayeeCurrency: p.createTable({
    id: p.string(),
    payeeId: p.hex().references("Payee.id"),
    payee: p.one("payeeId"),
    currencyId: p.hex().references("Currency.id"),
    currency: p.one("currencyId"),

    // Values
    toWithdraw: p.bigint(),
    toPayToProtocol: p.bigint(),
    withdrawn: p.bigint(),
    paidToProtocol: p.bigint(),
    totalCreatorFees: p.bigint(),
    totalReferralFees: p.bigint(),

    // Relations
    slicerPayments: p.many("PayeeSlicerCurrency.payeeCurrencyId")
  }),

  PayeeSlicerCurrency: p.createTable({
    id: p.string(),
    payeeSlicerId: p.string().references("PayeeSlicer.id"),
    payeeSlicer: p.one("payeeSlicerId"),
    currencySlicerId: p.string().references("CurrencySlicer.id"),
    currencySlicer: p.one("currencySlicerId"),
    payeeCurrencyId: p.string().references("PayeeCurrency.id"),
    payeeCurrency: p.one("payeeCurrencyId"),

    // Values
    paidForProducts: p.bigint()
  }),

  ReleaseEvent: p.createTable({
    id: p.string(),

    // Values
    amountReleased: p.bigint(),
    timestamp: p.bigint(),

    // Relations
    slicerId: p.bigint().references("Slicer.id"),
    slicer: p.one("slicerId"),

    currencyId: p.hex().references("Currency.id"),
    currency: p.one("currencyId"),

    payeeId: p.hex().references("Payee.id"),
    payee: p.one("payeeId"),

    currencySlicerId: p.string().references("CurrencySlicer.id"),
    currencySlicer: p.one("currencySlicerId")
  }),

  Product: p.createTable({
    id: p.bigint(),

    // Values
    categoryIndex: p.bigint(),
    isRemoved: p.boolean(),
    isFree: p.boolean(),
    isInfinite: p.boolean(),
    availableUnits: p.bigint(),
    maxUnitsPerBuyer: p.bigint(),
    creator: p.hex(),
    data: p.hex(),
    createdAtTimestamp: p.bigint(),
    extAddress: p.hex(),
    extValue: p.bigint(),
    extCheckSig: p.hex(),
    extExecSig: p.hex(),
    extData: p.hex(),
    extRelativePrice: p.boolean(),
    extPreferredToken: p.boolean(),
    totalPurchases: p.bigint(),
    referralFeeProduct: p.bigint(),

    // Relations
    slicerId: p.bigint().references("Slicer.id"),
    slicer: p.one("slicerId"),

    purchaseData: p.many("PurchaseData.productId"),
    prices: p.many("ProductPrices.productId"),
    purchases: p.many("ProductPurchase.productId"),
    subProducts: p.many("ProductRelation.parentProductId"),
    parentProducts: p.many("ProductRelation.childProductId")
  }),

  ProductRelation: p.createTable({
    id: p.string(),
    parentProductId: p.bigint().references("Product.id"),
    parentProduct: p.one("parentProductId"),
    childProductId: p.bigint().references("Product.id"),
    childProduct: p.one("childProductId")
  }),

  ProductPrices: p.createTable({
    id: p.string(),

    // Values
    price: p.bigint(),
    isPriceDynamic: p.boolean(),
    externalAddress: p.hex(),

    // Relations
    productId: p.bigint().references("Product.id"),
    product: p.one("productId"),

    currencyId: p.hex().references("Currency.id"),
    currency: p.one("currencyId")
  }),

  ProductPurchase: p.createTable({
    id: p.string(),

    // Values
    totalPaymentEth: p.bigint(),
    totalPaymentCurrency: p.bigint(),
    lastPurchasedAtTimestamp: p.bigint(),
    totalQuantity: p.bigint(),
    totalPurchases: p.bigint(),

    // Relations
    productId: p.bigint().references("Product.id"),
    product: p.one("productId"),

    buyerId: p.hex().references("Payee.id"),
    buyer: p.one("buyerId"),

    buyerSlicerId: p.string().references("PayeeSlicer.id"),
    buyerSlicer: p.one("buyerSlicerId"),

    currencySlicerId: p.string().references("CurrencySlicer.id"),
    currencySlicer: p.one("currencySlicerId"),

    purchaseData: p.many("PurchaseData.productPurchaseId")
  }),

  PurchaseData: p.createTable({
    id: p.string(),

    // Values
    quantity: p.bigint(),
    paymentEth: p.bigint(),
    paymentCurrency: p.bigint(),
    externalPaymentEth: p.bigint(),
    externalPaymentCurrency: p.bigint(),
    referralEth: p.bigint(),
    referralCurrency: p.bigint(),
    startPurchaseId: p.bigint(),
    timestamp: p.bigint(),
    transactionHash: p.hex(),

    // Relations
    slicerId: p.bigint().references("Slicer.id"),
    slicer: p.one("slicerId"),

    productId: p.bigint().references("Product.id"),
    product: p.one("productId"),

    orderId: p.hex().references("Order.id"),
    order: p.one("orderId"),

    productPurchaseId: p.string().references("ProductPurchase.id").optional(),
    productPurchase: p.one("productPurchaseId"),

    parentSlicerId: p.bigint().references("Slicer.id").optional(),
    parentSlicer: p.one("parentSlicerId"),

    parentProductId: p.bigint().references("Product.id").optional(),
    parentProduct: p.one("parentProductId")
  }),

  Order: p.createTable({
    id: p.hex(),
    timestamp: p.bigint(),

    // Relations
    payerId: p.hex().references("Payee.id"),
    payer: p.one("payerId"),

    buyerId: p.hex().references("Payee.id"),
    buyer: p.one("buyerId"),

    referrerId: p.hex().references("Payee.id"),
    referrer: p.one("referrerId"),

    extraCosts: p.many("ExtraCost.orderId"),
    purchaseData: p.many("PurchaseData.orderId")
  }),

  ExtraCost: p.createTable({
    id: p.string(),

    // Values
    recipient: p.hex().optional(),
    amount: p.bigint(),
    description: p.string(),

    // Relations
    orderId: p.hex().references("Order.id"),
    order: p.one("orderId"),

    currencyId: p.hex().references("Currency.id"),
    currency: p.one("currencyId"),

    slicerId: p.bigint().optional().references("Slicer.id"),
    slicer: p.one("slicerId")
  })
}))
