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
    payees: p.many("PayeeSlicer.slicerId"),
    acceptedCurrencies: p.many("CurrencySlicer.slicerId"),

    creatorId: p.hex().references("Payee.id"),
    creator: p.one("creatorId"),

    controllerId: p.hex().references("Payee.id"),
    controller: p.one("controllerId"),

    royaltyReceiverId: p.hex().references("Payee.id"),
    royaltyReceiver: p.one("royaltyReceiverId")

    // childrenSlicers: p.many("Slicer.id"),
    // products: p.many("Product.id"),
    // TokenListings: p.many("TokenListing.id"),
    // purchaseData: p.many("PurchaseData.id")
    // TokensReceived: p.many("TokenReceived.id"), // Commented out as in original schema
  }),

  Payee: p.createTable({
    id: p.hex(),

    // Relations
    slicersOwned: p.many("PayeeSlicer.payeeId"),
    slicersCreated: p.many("Slicer.creatorId"),
    slicersControlled: p.many("Slicer.controllerId"),
    slicersRoyaltyReceiver: p.many("Slicer.royaltyReceiverId")
    // currencies: p.many("PayeeCurrency.id"),
    // purchases: p.many("ProductPurchase.id"),
    // orders: p.many("Order.id"),
    // referrals: p.many("Order.id")
  }),

  PayeeSlicer: p.createTable({
    id: p.string(),
    payeeId: p.hex().references("Payee.id"),
    slicerId: p.bigint().references("Slicer.id"),
    payee: p.one("payeeId"),
    slicer: p.one("slicerId"),

    // Values
    slices: p.bigint(),
    transfersAllowedWhileLocked: p.boolean()

    // Relations
    // currencyPayments: p.many("PayeeSlicerCurrency.id"),
    // purchases: p.many("ProductPurchase.id")
  }),

  Currency: p.createTable({
    id: p.hex(),

    // Relations
    slicers: p.many("CurrencySlicer.currencyId")
    // payees: p.many("PayeeCurrency.id"),
    // products: p.many("ProductPrices.id")
  }),

  CurrencySlicer: p.createTable({
    id: p.string(),
    currencyId: p.hex().references("Currency.id"),
    slicerId: p.bigint().references("Slicer.id"),
    currency: p.one("currencyId"),
    slicer: p.one("slicerId"),

    // Values
    released: p.bigint(),
    releasedToProtocol: p.bigint(),
    creatorFeePaid: p.bigint()

    // Relations
    // releaseEvents: p.many("ReleaseEvent.id"),
    // payeePayments: p.many("PayeeSlicerCurrency.id"),
    // purchases: p.many("ProductPurchase.id")
  })

  // Product: p.createTable({
  //   id: p.string(),
  //   slicer: p.string().references("Slicer.id"),
  //   categoryIndex: p.bigint(),
  //   isRemoved: p.boolean(),
  //   isFree: p.boolean(),
  //   isInfinite: p.boolean(),
  //   availableUnits: p.bigint(),
  //   maxUnitsPerBuyer: p.bigint(),
  //   creator: p.bytes(),
  //   data: p.bytes(),
  //   createdAtTimestamp: p.bigint(),
  //   extAddress: p.bytes(),
  //   extValue: p.bigint(),
  //   extCheckSig: p.bytes(),
  //   extExecSig: p.bytes(),
  //   extData: p.bytes(),
  //   extRelativePrice: p.boolean(),
  //   extPreferredToken: p.boolean(),
  //   totalPurchases: p.bigint(),
  //   referralFeeProduct: p.bigint(),
  //   subProducts: p.many("Product.id"),
  //   prices: p.many("ProductPrices.id"),
  //   purchases: p.many("ProductPurchase.id"),
  //   purchaseData: p.many("PurchaseData.id")
  // }),

  // PayeeCurrency: p.createTable({
  //   id: p.string(),
  //   payee: p.string().references("Payee.id"),
  //   currency: p.string().references("Currency.id"),
  //   toWithdraw: p.bigint(),
  //   toPayToProtocol: p.bigint(),
  //   withdrawn: p.bigint(),
  //   paidToProtocol: p.bigint(),
  //   totalCreatorFees: p.bigint(),
  //   totalReferralFees: p.bigint(),
  //   slicerPayments: p.many("PayeeSlicerCurrency.id")
  // }),

  // ReleaseEvent: p.createTable({
  //   id: p.string(),
  //   slicer: p.string().references("Slicer.id"),
  //   currency: p.string().references("Currency.id"),
  //   payee: p.string().references("Payee.id"),
  //   currencySlicer: p.string().references("CurrencySlicer.id"),
  //   amountReleased: p.bigint(),
  //   timestamp: p.bigint()
  // }),

  // PayeeSlicerCurrency: p.createTable({
  //   id: p.string(),
  //   payeeSlicer: p.string().references("PayeeSlicer.id"),
  //   payeeCurrency: p.string().references("PayeeCurrency.id"),
  //   currencySlicer: p.string().references("CurrencySlicer.id"),
  //   paidForProducts: p.bigint()
  // }),

  // ProductPrices: p.createTable({
  //   id: p.string(),
  //   product: p.string().references("Product.id"),
  //   currency: p.string().references("Currency.id"),
  //   price: p.bigint(),
  //   dynamicPricing: p.boolean(),
  //   externalAddress: p.bytes()
  // }),

  // ProductPurchase: p.createTable({
  //   id: p.string(),
  //   product: p.string().references("Product.id"),
  //   buyerSlicer: p.string().references("PayeeSlicer.id"),
  //   currencySlicer: p.string().references("CurrencySlicer.id"),
  //   buyer: p.string().references("Payee.id"),
  //   totalPaymentEth: p.bigint(),
  //   totalPaymentCurrency: p.bigint(),
  //   lastPurchasedAtTimestamp: p.bigint(),
  //   totalQuantity: p.bigint(),
  //   totalPurchases: p.bigint(),
  //   purchaseData: p.many("PurchaseData.id")
  // }),

  // PurchaseData: p.createTable({
  //   id: p.string(),
  //   slicer: p.string().references("Slicer.id"),
  //   product: p.string().references("Product.id"),
  //   parentSlicer: p.string().references("Slicer.id").optional(),
  //   parentProduct: p.string().references("Product.id").optional(),
  //   productPurchase: p.string().references("ProductPurchase.id"),
  //   order: p.string().references("Order.id"),
  //   quantity: p.bigint(),
  //   paymentEth: p.bigint(),
  //   paymentCurrency: p.bigint(),
  //   externalPaymentEth: p.bigint(),
  //   externalPaymentCurrency: p.bigint(),
  //   referralEth: p.bigint(),
  //   referralCurrency: p.bigint(),
  //   startPurchaseId: p.bigint(),
  //   timestamp: p.bigint(),
  //   transactionHash: p.bytes()
  // }),

  // Order: p.createTable({
  //   id: p.string(), // transactionHash
  //   timestamp: p.bigint(),
  //   payer: p.string().references("Payee.id"),
  //   buyer: p.string().references("Payee.id"),
  //   referrer: p.string().references("Payee.id"),
  //   extraCosts: p.many("ExtraCost.id"),
  //   purchaseData: p.many("PurchaseData.id")
  // }),

  // ExtraCost: p.createTable({
  //   id: p.string(),
  //   // slicer: p.string().references("Slicer.id"), // TODO: Add relation to slicer
  //   order: p.string().references("Order.id"),
  //   recipient: p.bytes(),
  //   currency: p.string().references("Currency.id"),
  //   amount: p.bigint(),
  //   description: p.string()
  // }),

  // TokenListing: p.createTable({
  //   id: p.string(),
  //   slicer: p.string().references("Slicer.id"),
  //   contract: p.bytes(),
  //   tokenId: p.bigint(),
  //   isERC721: p.boolean(),
  //   quantity: p.bigint(),
  //   lastEditedAtTimestamp: p.bigint()
  // })
}))
