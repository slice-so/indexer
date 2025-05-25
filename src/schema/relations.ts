import {
  currencySlicerDay,
  currencySlicerMonth,
  currencySlicerWeek,
  currencySlicerYear
} from "ponder:schema"
import {
  slicerStatsByDay,
  slicerStatsByMonth,
  slicerStatsByWeek,
  slicerStatsByYear
} from "@/schema/stats"
import {
  categoryProduct,
  categoryProductHierarchy,
  currency,
  currencySlicer,
  extraCost,
  order,
  orderProduct,
  orderProductRelation,
  orderSlicer,
  payee,
  payeeCurrency,
  payeeSlicer,
  payeeSlicerCurrency,
  product,
  productPrice,
  productRelation,
  productType,
  productTypeHierarchy,
  releaseEvent,
  slicer,
  slicerRelation
} from "@/schema/tables"
import { relations } from "ponder"

export const slicerRelations = relations(slicer, ({ one, many }) => ({
  creator: one(payee, {
    relationName: "creator",
    fields: [slicer.creatorId],
    references: [payee.id]
  }),
  controller: one(payee, {
    relationName: "controller",
    fields: [slicer.controllerId],
    references: [payee.id]
  }),
  royaltyReceiver: one(payee, {
    relationName: "royaltyReceiver",
    fields: [slicer.royaltyReceiverId],
    references: [payee.id]
  }),
  acceptedCurrencies: many(currencySlicer),
  payees: many(payeeSlicer),
  products: many(product),
  orderSlicers: many(orderSlicer),
  orderProducts: many(orderProduct),
  extraCosts: many(extraCost),
  productTypes: many(productType),
  productTypeHierarchies: many(productTypeHierarchy),
  currencyPayments: many(payeeSlicerCurrency),
  releaseEvents: many(releaseEvent),
  parentSlicers: many(slicerRelation, { relationName: "childSlicer" }),
  childSlicers: many(slicerRelation, { relationName: "parentSlicer" }),
  currencyEarningsByDay: many(currencySlicerDay),
  currencyEarningsByWeek: many(currencySlicerWeek),
  currencyEarningsByMonth: many(currencySlicerMonth),
  currencyEarningsByYear: many(currencySlicerYear),
  statsByDay: many(slicerStatsByDay),
  statsByWeek: many(slicerStatsByWeek),
  statsByMonth: many(slicerStatsByMonth),
  statsByYear: many(slicerStatsByYear)
}))

export const slicerRelationRelations = relations(slicerRelation, ({ one }) => ({
  parentSlicer: one(slicer, {
    relationName: "parentSlicer",
    fields: [slicerRelation.parentSlicerId],
    references: [slicer.id]
  }),
  childSlicer: one(slicer, {
    relationName: "childSlicer",
    fields: [slicerRelation.childSlicerId],
    references: [slicer.id]
  })
}))

export const payeeRelations = relations(payee, ({ many }) => ({
  slicersOwned: many(payeeSlicer),
  slicersCreated: many(slicer, { relationName: "creator" }),
  slicersControlled: many(slicer, { relationName: "controller" }),
  slicersRoyaltyReceiver: many(slicer, { relationName: "royaltyReceiver" }),
  currencies: many(payeeCurrency),
  ordersMade: many(order, { relationName: "buyer" }),
  ordersPaid: many(order, { relationName: "payer" }),
  ordersReferred: many(order, { relationName: "referrer" }),
  paidForProducts: many(payeeSlicerCurrency),
  releaseEvents: many(releaseEvent)
}))

export const payeeSlicerRelations = relations(payeeSlicer, ({ one, many }) => ({
  payee: one(payee, {
    fields: [payeeSlicer.payeeId],
    references: [payee.id]
  }),
  slicer: one(slicer, {
    fields: [payeeSlicer.slicerId],
    references: [slicer.id]
  }),
  currencyPayments: many(payeeSlicerCurrency),
  orderProducts: many(orderProduct, { relationName: "buyerSlicer" })
}))

export const currencyRelations = relations(currency, ({ many }) => ({
  slicers: many(currencySlicer),
  payees: many(payeeCurrency),
  productPrices: many(productPrice),
  orderProducts: many(orderProduct),
  currencyPayments: many(payeeSlicerCurrency),
  extraCosts: many(extraCost),
  releaseEvents: many(releaseEvent),
  slicerEarningsByDay: many(currencySlicerDay),
  slicerEarningsByWeek: many(currencySlicerWeek),
  slicerEarningsByMonth: many(currencySlicerMonth),
  slicerEarningsByYear: many(currencySlicerYear)
}))

export const currencySlicerRelations = relations(
  currencySlicer,
  ({ one, many }) => ({
    currency: one(currency, {
      fields: [currencySlicer.currencyId],
      references: [currency.id]
    }),
    slicer: one(slicer, {
      fields: [currencySlicer.slicerId],
      references: [slicer.id]
    }),
    payeePayments: many(payeeSlicerCurrency),
    releaseEvents: many(releaseEvent)
  })
)

export const productRelations = relations(product, ({ one, many }) => ({
  slicer: one(slicer, {
    fields: [product.slicerId],
    references: [slicer.id]
  }),
  category: one(categoryProduct, {
    fields: [product.categoryId],
    references: [categoryProduct.id]
  }),
  productType: one(productType, {
    fields: [product.slicerId, product.productTypeId],
    references: [productType.slicerId, productType.productTypeId]
  }),
  orderProducts: many(orderProduct),
  prices: many(productPrice),
  subProducts: many(productRelation, { relationName: "parentProduct" }),
  parentProducts: many(productRelation, { relationName: "childProduct" })
}))

export const productRelationRelations = relations(
  productRelation,
  ({ one }) => ({
    parentProduct: one(product, {
      relationName: "parentProduct",
      fields: [productRelation.parentSlicerId, productRelation.parentProductId],
      references: [product.slicerId, product.id]
    }),
    childProduct: one(product, {
      relationName: "childProduct",
      fields: [productRelation.childSlicerId, productRelation.childProductId],
      references: [product.slicerId, product.id]
    })
  })
)

export const productPriceRelations = relations(productPrice, ({ one }) => ({
  product: one(product, {
    fields: [productPrice.slicerId, productPrice.productId],
    references: [product.slicerId, product.id]
  }),
  currency: one(currency, {
    fields: [productPrice.currencyId],
    references: [currency.id]
  })
}))

export const orderRelations = relations(order, ({ one, many }) => ({
  payer: one(payee, {
    relationName: "payer",
    fields: [order.payerId],
    references: [payee.id]
  }),
  buyer: one(payee, {
    relationName: "buyer",
    fields: [order.buyerId],
    references: [payee.id]
  }),
  referrer: one(payee, {
    relationName: "referrer",
    fields: [order.referrerId],
    references: [payee.id]
  }),
  orderSlicers: many(orderSlicer),
  orderProducts: many(orderProduct),
  extraCosts: many(extraCost)
}))

export const orderSlicerRelations = relations(orderSlicer, ({ one, many }) => ({
  order: one(order, {
    fields: [orderSlicer.orderId],
    references: [order.id]
  }),
  slicer: one(slicer, {
    fields: [orderSlicer.slicerId],
    references: [slicer.id]
  }),
  orderProducts: many(orderProduct),
  extraCosts: many(extraCost)
}))

export const orderProductRelations = relations(
  orderProduct,
  ({ one, many }) => ({
    slicer: one(slicer, {
      fields: [orderProduct.slicerId],
      references: [slicer.id]
    }),
    order: one(order, {
      fields: [orderProduct.orderId],
      references: [order.id]
    }),
    product: one(product, {
      fields: [orderProduct.slicerId, orderProduct.productId],
      references: [product.slicerId, product.id]
    }),
    productCategory: one(categoryProduct, {
      fields: [orderProduct.productCategoryId],
      references: [categoryProduct.id]
    }),
    orderSlicer: one(orderSlicer, {
      fields: [orderProduct.orderId, orderProduct.slicerId],
      references: [orderSlicer.orderId, orderSlicer.slicerId]
    }),
    currency: one(currency, {
      fields: [orderProduct.currencyId],
      references: [currency.id]
    }),
    buyerSlicer: one(payeeSlicer, {
      fields: [orderProduct.buyerId, orderProduct.slicerId],
      references: [payeeSlicer.payeeId, payeeSlicer.slicerId]
    }),
    orderParentProducts: many(orderProductRelation, {
      relationName: "subLink"
    }),
    orderSubProducts: many(orderProductRelation, { relationName: "parentLink" })
  })
)

export const orderProductRelationRelations = relations(
  orderProductRelation,
  ({ one }) => ({
    orderParentProduct: one(orderProduct, {
      relationName: "parentLink",
      fields: [
        orderProductRelation.orderId,
        orderProductRelation.orderParentSlicerId,
        orderProductRelation.orderParentProductId,
        orderProductRelation.currencyId
      ],
      references: [
        orderProduct.orderId,
        orderProduct.slicerId,
        orderProduct.productId,
        orderProduct.currencyId
      ]
    }),
    orderSubProduct: one(orderProduct, {
      relationName: "subLink",
      fields: [
        orderProductRelation.orderId,
        orderProductRelation.orderSubSlicerId,
        orderProductRelation.orderSubProductId,
        orderProductRelation.currencyId
      ],
      references: [
        orderProduct.orderId,
        orderProduct.slicerId,
        orderProduct.productId,
        orderProduct.currencyId
      ]
    })
  })
)

export const extraCostRelations = relations(extraCost, ({ one }) => ({
  order: one(order, {
    fields: [extraCost.orderId],
    references: [order.id]
  }),
  orderSlicer: one(orderSlicer, {
    fields: [extraCost.orderId, extraCost.slicerId],
    references: [orderSlicer.orderId, orderSlicer.slicerId]
  }),
  currency: one(currency, {
    fields: [extraCost.currencyId],
    references: [currency.id]
  }),
  slicer: one(slicer, {
    fields: [extraCost.slicerId],
    references: [slicer.id]
  })
}))

export const payeeCurrencyRelations = relations(
  payeeCurrency,
  ({ one, many }) => ({
    payee: one(payee, {
      fields: [payeeCurrency.payeeId],
      references: [payee.id]
    }),
    currency: one(currency, {
      fields: [payeeCurrency.currencyId],
      references: [currency.id]
    }),
    slicerPayments: many(payeeSlicerCurrency)
  })
)

export const payeeSlicerCurrencyRelations = relations(
  payeeSlicerCurrency,
  ({ one }) => ({
    payee: one(payee, {
      fields: [payeeSlicerCurrency.payeeId],
      references: [payee.id]
    }),
    slicer: one(slicer, {
      fields: [payeeSlicerCurrency.slicerId],
      references: [slicer.id]
    }),
    currency: one(currency, {
      fields: [payeeSlicerCurrency.currencyId],
      references: [currency.id]
    }),
    payeeSlicer: one(payeeSlicer, {
      fields: [payeeSlicerCurrency.payeeId, payeeSlicerCurrency.slicerId],
      references: [payeeSlicer.payeeId, payeeSlicer.slicerId]
    }),
    currencySlicer: one(currencySlicer, {
      fields: [payeeSlicerCurrency.currencyId, payeeSlicerCurrency.slicerId],
      references: [currencySlicer.currencyId, currencySlicer.slicerId]
    }),
    payeeCurrency: one(payeeCurrency, {
      fields: [payeeSlicerCurrency.payeeId, payeeSlicerCurrency.currencyId],
      references: [payeeCurrency.payeeId, payeeCurrency.currencyId]
    })
  })
)

export const releaseEventRelations = relations(releaseEvent, ({ one }) => ({
  slicer: one(slicer, {
    fields: [releaseEvent.slicerId],
    references: [slicer.id]
  }),
  currency: one(currency, {
    fields: [releaseEvent.currencyId],
    references: [currency.id]
  }),
  payee: one(payee, {
    fields: [releaseEvent.payeeId],
    references: [payee.id]
  }),
  currencySlicer: one(currencySlicer, {
    fields: [releaseEvent.currencyId, releaseEvent.slicerId],
    references: [currencySlicer.currencyId, currencySlicer.slicerId]
  })
}))

export const categoryProductRelations = relations(
  categoryProduct,
  ({ one, many }) => ({
    parentCategory: one(categoryProduct, {
      fields: [categoryProduct.parentCategoryId],
      references: [categoryProduct.id]
    }),
    subCategories: many(categoryProduct),
    products: many(product),
    ancestors: many(categoryProductHierarchy, { relationName: "descendant" }),
    descendants: many(categoryProductHierarchy, {
      relationName: "ancestor"
    }),
    orderProducts: many(orderProduct)
  })
)

export const categoryProductHierRelations = relations(
  categoryProductHierarchy,
  ({ one }) => ({
    ancestor: one(categoryProduct, {
      relationName: "ancestor",
      fields: [categoryProductHierarchy.ancestorId],
      references: [categoryProduct.id]
    }),
    descendant: one(categoryProduct, {
      relationName: "descendant",
      fields: [categoryProductHierarchy.descendantId],
      references: [categoryProduct.id]
    })
  })
)

export const productTypeRelations = relations(productType, ({ one, many }) => ({
  slicer: one(slicer, {
    fields: [productType.slicerId],
    references: [slicer.id]
  }),
  parentProductType: one(productType, {
    fields: [productType.slicerId, productType.parentProductTypeId],
    references: [productType.slicerId, productType.productTypeId]
  }),
  subProductTypes: many(productType),
  products: many(product),
  ancestors: many(productTypeHierarchy, { relationName: "descendant" }),
  descendants: many(productTypeHierarchy, { relationName: "ancestor" })
}))

export const productTypeHierRelations = relations(
  productTypeHierarchy,
  ({ one }) => ({
    slicer: one(slicer, {
      fields: [productTypeHierarchy.slicerId],
      references: [slicer.id]
    }),
    ancestor: one(productType, {
      relationName: "ancestor",
      fields: [productTypeHierarchy.slicerId, productTypeHierarchy.ancestorId],
      references: [productType.slicerId, productType.productTypeId]
    }),
    descendant: one(productType, {
      relationName: "descendant",
      fields: [
        productTypeHierarchy.slicerId,
        productTypeHierarchy.descendantId
      ],
      references: [productType.slicerId, productType.productTypeId]
    })
  })
)
