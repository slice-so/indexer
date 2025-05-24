import { index, onchainTable, primaryKey } from "ponder"

export const slicer = onchainTable(
	"slicer_indexer",
	(t) => ({
		id: t.integer().primaryKey(),
		slicerVersion: t.bigint().notNull(),
		address: t.hex().notNull(),
		slices: t.bigint().notNull(),
		minimumSlices: t.bigint().notNull(),
		createdAtTimestamp: t.bigint().notNull(),
		releaseTimelock: t.bigint().notNull(),
		transferableTimelock: t.integer().notNull(),
		protocolFee: t.integer().notNull(),
		royaltyPercentage: t.integer().notNull(),
		productsModuleBalance: t.bigint().notNull(),
		productsModuleReleased: t.bigint().notNull(),
		referralFeeStore: t.bigint().notNull(),
		isImmutable: t.boolean().notNull(),
		currenciesControlled: t.boolean().notNull(),
		productsControlled: t.boolean().notNull(),
		resliceAllowed: t.boolean().notNull(),
		transferWhileControlledAllowed: t.boolean().notNull(),
		acceptsAllCurrencies: t.boolean().notNull(),
		storeClosed: t.boolean().notNull(),
		creatorId: t.hex().notNull(),
		controllerId: t.hex().notNull(),
		royaltyReceiverId: t.hex().notNull(),
		totalOrders: t.bigint().notNull(),
		totalProductsPurchased: t.bigint().notNull(),
		totalEarnedUsd: t.bigint().notNull(),
		releasedUsd: t.bigint().notNull()
	}),
	(table) => ({
		slicerAddressIdx: index().on(table.address)
	})
)

export const slicerRelation = onchainTable(
	"slicer_relation",
	(t) => ({
		parentSlicerId: t.integer().notNull(),
		childSlicerId: t.integer().notNull()
	}),
	(table) => ({
		pk: primaryKey({ columns: [table.parentSlicerId, table.childSlicerId] }),
		parentSlicerIdx: index().on(table.parentSlicerId),
		childSlicerIdx: index().on(table.childSlicerId)
	})
)

export const payee = onchainTable("payee", (t) => ({
	id: t.hex().primaryKey()
}))

export const payeeSlicer = onchainTable(
	"payee_slicer",
	(t) => ({
		payeeId: t.hex().notNull(),
		slicerId: t.integer().notNull(),
		slices: t.bigint().notNull(),
		transfersAllowedWhileLocked: t.boolean().notNull()
	}),
	(table) => ({
		pk: primaryKey({ columns: [table.payeeId, table.slicerId] }),
		payeeIdx: index().on(table.payeeId),
		slicerIdx: index().on(table.slicerId)
	})
)

export const currency = onchainTable("currency_indexer", (t) => ({
	id: t.hex().primaryKey()
}))

export const currencySlicer = onchainTable(
	"currency_slicer",
	(t) => ({
		currencyId: t.hex().notNull(),
		slicerId: t.integer().notNull(),
		released: t.bigint().notNull(),
		releasedToProtocol: t.bigint().notNull(),
		creatorFeePaid: t.bigint().notNull(),
		referralFeePaid: t.bigint().notNull(),
		releasedUsd: t.bigint().notNull(),
		totalEarned: t.bigint().notNull()
	}),
	(table) => ({
		pk: primaryKey({ columns: [table.currencyId, table.slicerId] }),
		currencyIdx: index().on(table.currencyId),
		slicerIdx: index().on(table.slicerId)
	})
)

export const categoryProduct = onchainTable("category_product", (t) => ({
	id: t.integer().primaryKey(),
	name: t.text().notNull(),
	parentCategoryId: t.integer().default(0)
}))

export const categoryProductHierarchy = onchainTable(
	"category_product_hierarchy",
	(t) => ({
		ancestorId: t.integer().notNull(),
		descendantId: t.integer().notNull(),
		depth: t.integer().notNull()
	}),
	(table) => ({
		pk: primaryKey({ columns: [table.ancestorId, table.descendantId] })
	})
)

export const productType = onchainTable(
	"product_type",
	(t) => ({
		slicerId: t.integer().notNull(),
		productTypeId: t.integer().notNull(),
		name: t.text().notNull(),
		parentProductTypeId: t.integer().default(0)
	}),
	(table) => ({
		pk: primaryKey({ columns: [table.slicerId, table.productTypeId] }),
		slicerIdx: index().on(table.slicerId),
		productTypeIdIdx: index().on(table.productTypeId)
	})
)

export const productTypeHierarchy = onchainTable(
	"product_type_hierarchy",
	(t) => ({
		slicerId: t.integer().notNull(),
		ancestorId: t.integer().notNull(),
		descendantId: t.integer().notNull(),
		depth: t.integer().notNull()
	}),
	(tbl) => ({
		pk: primaryKey({
			columns: [tbl.slicerId, tbl.ancestorId, tbl.descendantId]
		})
	})
)

export const product = onchainTable(
	"productIndexer",
	(t) => ({
		id: t.integer().notNull(),
		slicerId: t.integer().notNull(),
		isRemoved: t.boolean().notNull(),
		isFree: t.boolean().notNull(),
		isInfinite: t.boolean().notNull(),
		availableUnits: t.bigint().notNull(),
		maxUnitsPerBuyer: t.integer().notNull(),
		creatorId: t.hex().notNull(),
		data: t.hex().notNull(),
		createdAtTimestamp: t.bigint().notNull(),
		extAddress: t.hex(),
		extValue: t.bigint(),
		extCheckSig: t.hex(),
		extExecSig: t.hex(),
		extData: t.hex(),
		extRelativePrice: t.boolean().notNull(),
		extPreferredToken: t.boolean().notNull(),
		totalPurchases: t.bigint().notNull(),
		referralFeeProduct: t.bigint().notNull(),
		lastPurchasedAtTimestamp: t.bigint(),
		categoryId: t.integer().notNull(),
		productTypeId: t.integer().notNull()
	}),
	(table) => ({
		pk: primaryKey({ columns: [table.slicerId, table.id] }),
		slicerIdx: index().on(table.slicerId),
		productIdIdx: index().on(table.id),
		extAddressIdx: index().on(table.extAddress)
	})
)

/* product ⇄ product junction */
export const productRelation = onchainTable(
	"product_relation",
	(t) => ({
		parentSlicerId: t.integer().notNull(),
		parentProductId: t.integer().notNull(),
		childSlicerId: t.integer().notNull(),
		childProductId: t.integer().notNull()
	}),
	(table) => ({
		pk: primaryKey({
			columns: [
				table.parentSlicerId,
				table.parentProductId,
				table.childSlicerId,
				table.childProductId
			]
		}),
		parentSlicerIdx: index().on(table.parentSlicerId),
		parentProductIdx: index().on(table.parentProductId),
		childSlicerIdx: index().on(table.childSlicerId),
		childProductIdx: index().on(table.childProductId)
	})
)

export const productPrice = onchainTable(
	"product_price",
	(t) => ({
		slicerId: t.integer().notNull(),
		productId: t.integer().notNull(),
		currencyId: t.hex().notNull(),
		price: t.bigint().notNull(),
		isPriceDynamic: t.boolean().notNull(),
		externalAddress: t.hex().notNull()
	}),
	(table) => ({
		pk: primaryKey({
			columns: [table.slicerId, table.productId, table.currencyId]
		}),
		slicerIdx: index().on(table.slicerId),
		productIdIdx: index().on(table.productId),
		currencyIdx: index().on(table.currencyId),
		externalAddressIdx: index().on(table.externalAddress)
	})
)

export const order = onchainTable("order_indexer", (t) => ({
	id: t.hex().primaryKey(),
	timestamp: t.bigint().notNull(),
	totalPaymentUsd: t.bigint().notNull(),
	totalReferralUsd: t.bigint().notNull(),
	payerId: t.hex().notNull(),
	buyerId: t.hex().notNull(),
	referrerId: t.hex().notNull()
}))

export const orderSlicer = onchainTable(
	"order_slicer",
	(t) => ({
		orderId: t.hex().notNull(),
		slicerId: t.integer().notNull(),
		totalPaymentUsd: t.bigint().notNull(),
		totalReferralUsd: t.bigint().notNull()
	}),
	(table) => ({
		pk: primaryKey({ columns: [table.orderId, table.slicerId] }),
		orderIdx: index().on(table.orderId),
		slicerIdx: index().on(table.slicerId)
	})
)

export const orderProduct = onchainTable(
	"order_product",
	(t) => ({
		orderId: t.hex().notNull(),
		buyerId: t.hex().notNull(),
		slicerId: t.integer().notNull(),
		productId: t.integer().notNull(),
		currencyId: t.hex().notNull(),
		productCategoryId: t.integer().notNull(),
		productTypeId: t.integer().notNull(),
		quantity: t.bigint().notNull(),
		paymentEth: t.bigint().notNull(),
		paymentCurrency: t.bigint().notNull(),
		paymentUsd: t.bigint().notNull(),
		externalPaymentEth: t.bigint().notNull(),
		externalPaymentCurrency: t.bigint().notNull(),
		externalPaymentUsd: t.bigint().notNull(),
		referralEth: t.bigint().notNull(),
		referralCurrency: t.bigint().notNull(),
		referralUsd: t.bigint().notNull()
	}),
	(table) => ({
		pk: primaryKey({
			columns: [
				table.orderId,
				table.slicerId,
				table.productId,
				table.currencyId
			]
		}),
		orderIdx: index().on(table.orderId),
		buyerIdx: index().on(table.buyerId),
		slicerIdx: index().on(table.slicerId),
		productIdIdx: index().on(table.productId),
		currencyIdx: index().on(table.currencyId)
	})
)

export const orderProductRelation = onchainTable(
	"order_product_relation",
	(t) => ({
		orderId: t.hex().notNull(),
		currencyId: t.hex().notNull(),
		orderParentSlicerId: t.integer().notNull(),
		orderParentProductId: t.integer().notNull(),
		orderSubSlicerId: t.integer().notNull(),
		orderSubProductId: t.integer().notNull()
	}),
	(table) => ({
		pk: primaryKey({
			columns: [
				table.orderId,
				table.currencyId,
				table.orderParentSlicerId,
				table.orderParentProductId,
				table.orderSubSlicerId,
				table.orderSubProductId
			]
		}),
		orderIdx: index().on(table.orderId),
		currencyIdx: index().on(table.currencyId),
		orderParentSlicerIdx: index().on(table.orderParentSlicerId),
		orderParentProductIdx: index().on(table.orderParentProductId),
		orderSubSlicerIdx: index().on(table.orderSubSlicerId),
		orderSubProductIdx: index().on(table.orderSubProductId)
	})
)

export const extraCost = onchainTable(
	"extra_cost",
	(t) => ({
		recipient: t.hex().notNull(),
		amount: t.bigint().notNull(),
		description: t.text().notNull(),
		orderId: t.hex().notNull(),
		currencyId: t.hex().notNull(),
		slicerId: t.integer(),
		amountUsd: t.bigint().notNull()
	}),
	(table) => ({
		pk: primaryKey({
			columns: [
				table.orderId,
				table.currencyId,
				table.recipient,
				table.description
			]
		}),
		orderIdx: index().on(table.orderId),
		currencyIdx: index().on(table.currencyId),
		recipientIdx: index().on(table.recipient),
		descriptionIdx: index().on(table.description)
	})
)

export const payeeCurrency = onchainTable(
	"payee_currency",
	(t) => ({
		payeeId: t.hex().notNull(),
		currencyId: t.hex().notNull(),
		toWithdraw: t.bigint().notNull(),
		toPayToProtocol: t.bigint().notNull(),
		withdrawn: t.bigint().notNull(),
		paidToProtocol: t.bigint().notNull(),
		totalCreatorFees: t.bigint().notNull(),
		totalReferralFees: t.bigint().notNull(),
		totalReferralFeesUsd: t.bigint().notNull()
	}),
	(table) => ({
		pk: primaryKey({ columns: [table.payeeId, table.currencyId] }),
		payeeIdx: index().on(table.payeeId),
		currencyIdx: index().on(table.currencyId)
	})
)

export const payeeSlicerCurrency = onchainTable(
	"payee_slicer_currency",
	(t) => ({
		payeeId: t.hex().notNull(),
		currencyId: t.hex().notNull(),
		slicerId: t.integer().notNull(),
		paidForProducts: t.bigint().notNull()
	}),
	(table) => ({
		pk: primaryKey({
			columns: [table.payeeId, table.slicerId, table.currencyId]
		}),
		payeeIdx: index().on(table.payeeId),
		slicerIdx: index().on(table.slicerId),
		currencyIdx: index().on(table.currencyId),
		currencySlicerIdx: index().on(table.currencyId, table.slicerId)
	})
)

export const releaseEvent = onchainTable(
	"release_event",
	(t) => ({
		slicerId: t.integer().notNull(),
		currencyId: t.hex().notNull(),
		payeeId: t.hex().notNull(),
		timestamp: t.bigint().notNull(),
		amountReleased: t.bigint().notNull(),
		amountReleasedUsd: t.bigint().notNull()
	}),
	(table) => ({
		pk: primaryKey({
			columns: [
				table.slicerId,
				table.currencyId,
				table.payeeId,
				table.timestamp
			]
		}),
		slicerIdx: index().on(table.slicerId),
		currencyIdx: index().on(table.currencyId),
		payeeIdx: index().on(table.payeeId),
		timestampIdx: index().on(table.timestamp)
	})
)
