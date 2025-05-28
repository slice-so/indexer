import { ponder } from "ponder:registry";
import type { Context } from "ponder:registry";
import {
  currencySlicer,
  currencySlicerDay,
  currencySlicerMonth,
  currencySlicerWeek,
  currencySlicerYear,
  order,
  orderProduct,
  orderProductRelation,
  orderSlicer as orderSlicerTable,
  payeeCurrency,
  payeeSlicer,
  payeeSlicerCurrency,
  product as productTable,
  slicerStatsByDay,
  slicerStatsByMonth,
  slicerStatsByWeek,
  slicerStatsByYear,
  slicer as slicerTable,
} from "ponder:schema";
import { getDates, getUsdcAmount, upsertPayees } from "@/utils";
import { type Transaction, and, eq, sql } from "ponder";
import { type Address, zeroAddress } from "viem";

const handleProductPaid = async ({
  context,
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
  parentProductId = undefined,
}: {
  context: Context;
  transaction: Transaction;
  timestamp: bigint;
  slicerId: number;
  productId: number;
  quantity: bigint;
  buyer: Address;
  currency: Address;
  price: {
    eth: bigint;
    currency: bigint;
    ethExternalCall: bigint;
    currencyExternalCall: bigint;
  };
  referrer?: Address;
  parentSlicerId?: number;
  parentProductId?: number;
}) => {
  const { db } = context;
  const totalPaymentEth = price.eth + price.ethExternalCall;
  const totalPaymentCurrency = price.currency + price.currencyExternalCall;

  const product = await db.find(productTable, {
    slicerId,
    id: productId,
  });
  const slicer = await db.find(slicerTable, { id: slicerId });
  if (!product || !slicer) return;

  // Await queries that I need for the rest of the logic
  const [
    paymentEthUsd,
    externalPaymentEthUsd,
    paymentCurrencyUsd,
    externalPaymentCurrencyUsd,
    productResult,
    orderSlicer,
  ] = await Promise.all([
    getUsdcAmount(context, zeroAddress, price.eth),
    getUsdcAmount(context, zeroAddress, price.ethExternalCall),
    getUsdcAmount(context, currency, price.currency),
    getUsdcAmount(context, currency, price.currencyExternalCall),
    db.update(productTable, { slicerId, id: productId }).set({
      totalPurchases: product.totalPurchases + quantity,
      availableUnits: product.isInfinite
        ? product.availableUnits
        : product.availableUnits - quantity,
    }),
    db.find(orderSlicerTable, {
      orderId: transaction.hash,
      slicerId,
    }),
  ]);

  const totalPaymentUsd =
    paymentEthUsd +
    externalPaymentEthUsd +
    paymentCurrencyUsd +
    externalPaymentCurrencyUsd;

  const payeesPromise = upsertPayees(db, [
    transaction.from,
    buyer,
    ...(referrer !== zeroAddress ? [referrer] : []),
  ]);

  const slicerPromise = db.update(slicerTable, { id: slicerId }).set((row) => ({
    totalProductsPurchased: row.totalProductsPurchased + quantity,
    totalEarnedUsd: row.totalEarnedUsd + totalPaymentUsd,
  }));

  const payeeSlicerPromise = db
    .insert(payeeSlicer)
    .values({
      payeeId: buyer,
      slicerId,
      slices: 0n,
      transfersAllowedWhileLocked: false,
    })
    .onConflictDoNothing();

  const currencyPromises = [];
  if (totalPaymentEth !== 0n) {
    currencyPromises.push(
      updateCurrencyTables({
        db,
        slicerId,
        buyer,
        currency: zeroAddress,
        amount: totalPaymentEth,
        timestamp,
      })
    );
  }

  if (totalPaymentCurrency !== 0n) {
    currencyPromises.push(
      updateCurrencyTables({
        db,
        slicerId,
        buyer,
        currency,
        amount: totalPaymentCurrency,
        timestamp,
      })
    );
  }

  const statsPromises = updateSlicerStats({
    db,
    slicerId,
    quantity,
    timestamp,
    totalAmountUsd: totalPaymentUsd,
    ordertoBeRecorded: !orderSlicer,
  });

  const referralFee =
    referrer !== zeroAddress
      ? product.referralFeeProduct || slicer.referralFeeStore || 0n
      : 0n;
  const referralAmount = getReferralAmount(
    currency === zeroAddress ? price.eth : price.currency,
    referralFee
  );
  const referralAmountUsd = getReferralAmount(
    currency === zeroAddress ? paymentEthUsd : paymentCurrencyUsd,
    referralFee
  );

  const referrerPromise = [];
  if (referrer !== zeroAddress) {
    referrerPromise.push(
      db
        .insert(payeeCurrency)
        .values({
          payeeId: referrer,
          currencyId: currency,
          toWithdraw: 0n,
          toPayToProtocol: 0n,
          withdrawn: 0n,
          paidToProtocol: 0n,
          totalCreatorFees: 0n,
          totalReferralFees: referralAmount,
          totalReferralFeesUsd: referralAmountUsd,
        })
        .onConflictDoUpdate((row) => ({
          totalReferralFees: row.totalReferralFees + referralAmount,
          totalReferralFeesUsd: row.totalReferralFeesUsd + referralAmountUsd,
        }))
    );
  }

  const orderPromise = db
    .insert(order)
    .values({
      id: transaction.hash,
      timestamp,
      payerId: transaction.from,
      buyerId: buyer,
      referrerId: referrer,
      totalPaymentUsd,
      referralAmount,
      totalReferralUsd: referralAmountUsd,
    })
    .onConflictDoUpdate((row) => ({
      totalPaymentUsd: row.totalPaymentUsd + totalPaymentUsd,
      totalReferralUsd: row.totalReferralUsd + referralAmountUsd,
    }));

  const orderSlicerPromise = db
    .insert(orderSlicerTable)
    .values({
      orderId: transaction.hash,
      slicerId,
      totalPaymentUsd,
      totalReferralUsd: referralAmountUsd,
    })
    .onConflictDoUpdate((row) => ({
      totalPaymentUsd: row.totalPaymentUsd + totalPaymentUsd,
      totalReferralUsd: row.totalReferralUsd + referralAmountUsd,
    }));

  const orderProductPromise = db
    .insert(orderProduct)
    .values({
      orderId: transaction.hash,
      buyerId: buyer,
      slicerId,
      productId,
      currencyId: currency,
      productCategoryId: product.categoryId,
      productTypeId: product.productTypeId,
      quantity,
      paymentEth: price.eth,
      paymentCurrency: price.currency,
      paymentUsd: paymentEthUsd + paymentCurrencyUsd,
      externalPaymentEth: price.ethExternalCall,
      externalPaymentCurrency: price.currencyExternalCall,
      externalPaymentUsd: externalPaymentEthUsd + externalPaymentCurrencyUsd,
      referralEth: currency === zeroAddress ? referralAmount : 0n,
      referralCurrency: currency === zeroAddress ? 0n : referralAmount,
      referralUsd: referralAmountUsd,
    })
    .onConflictDoUpdate((row) => ({
      quantity: row.quantity + quantity,
      paymentEth: row.paymentEth + price.eth,
      paymentCurrency: row.paymentCurrency + price.currency,
      externalPaymentEth: row.externalPaymentEth + price.ethExternalCall,
      externalPaymentCurrency:
        row.externalPaymentCurrency + price.currencyExternalCall,
      referralEth: row.referralEth + referralAmount,
      referralCurrency: row.referralCurrency + referralAmount,
      referralUsd: row.referralUsd + referralAmountUsd,
    }));

  const orderProductRelationPromise = [];
  if (parentSlicerId !== undefined && parentProductId !== undefined) {
    orderProductRelationPromise.push(
      db
        .insert(orderProductRelation)
        .values({
          orderId: transaction.hash,
          currencyId: currency,
          orderParentSlicerId: parentSlicerId,
          orderParentProductId: parentProductId,
          orderSubSlicerId: slicerId,
          orderSubProductId: productId,
        })
        .onConflictDoNothing()
    );
  }

  await Promise.all([
    payeesPromise,
    slicerPromise,
    payeeSlicerPromise,
    ...currencyPromises,
    ...statsPromises,
    ...referrerPromise,
    orderPromise,
    orderSlicerPromise,
    orderProductPromise,
    ...orderProductRelationPromise,
  ]);
};

const updateSlicerStats = ({
  db,
  slicerId,
  quantity,
  timestamp,
  totalAmountUsd,
  ordertoBeRecorded,
}: {
  db: Context["db"];
  slicerId: number;
  quantity: bigint;
  timestamp: bigint;
  totalAmountUsd: bigint;
  ordertoBeRecorded: boolean;
}) => {
  const { currentDay, currentWeek, currentMonth, currentYear } =
    getDates(timestamp);

  const newTotalOrders = ordertoBeRecorded ? 1n : 0n;

  const promises = [];

  // Upsert stats by year
  promises.push(
    db
      .insert(slicerStatsByYear)
      .values({
        slicerId,
        year: currentYear,
        totalOrders: newTotalOrders,
        totalProductsPurchased: quantity,
        totalEarnedUsd: totalAmountUsd,
      })
      .onConflictDoUpdate((row) => ({
        totalOrders: row.totalOrders + newTotalOrders,
        totalProductsPurchased: row.totalProductsPurchased + quantity,
        totalEarnedUsd: row.totalEarnedUsd + totalAmountUsd,
      }))
  );

  // Upsert stats by month
  promises.push(
    db
      .insert(slicerStatsByMonth)
      .values({
        slicerId,
        yearKey: currentYear,
        month: currentMonth,
        totalOrders: newTotalOrders,
        totalProductsPurchased: quantity,
        totalEarnedUsd: totalAmountUsd,
      })
      .onConflictDoUpdate((row) => ({
        totalOrders: row.totalOrders + newTotalOrders,
        totalProductsPurchased: row.totalProductsPurchased + quantity,
        totalEarnedUsd: row.totalEarnedUsd + totalAmountUsd,
      }))
  );

  // Upsert stats by week
  promises.push(
    db
      .insert(slicerStatsByWeek)
      .values({
        slicerId,
        yearKey: currentYear,
        monthKey: currentMonth,
        week: currentWeek,
        totalOrders: newTotalOrders,
        totalProductsPurchased: quantity,
        totalEarnedUsd: totalAmountUsd,
      })
      .onConflictDoUpdate((row) => ({
        totalOrders: row.totalOrders + newTotalOrders,
        totalProductsPurchased: row.totalProductsPurchased + quantity,
        totalEarnedUsd: row.totalEarnedUsd + totalAmountUsd,
      }))
  );

  // Upsert stats by day
  promises.push(
    db
      .insert(slicerStatsByDay)
      .values({
        slicerId,
        yearKey: currentYear,
        monthKey: currentMonth,
        weekKey: currentWeek,
        day: currentDay,
        totalOrders: newTotalOrders,
        totalProductsPurchased: quantity,
        totalEarnedUsd: totalAmountUsd,
      })
      .onConflictDoUpdate((row) => ({
        totalOrders: row.totalOrders + newTotalOrders,
        totalProductsPurchased: row.totalProductsPurchased + quantity,
        totalEarnedUsd: row.totalEarnedUsd + totalAmountUsd,
      }))
  );

  return promises;
};

const updateCurrencySlicerStats = ({
  db,
  slicerId,
  currency,
  amount,
  timestamp,
}: {
  db: Context["db"];
  slicerId: number;
  currency: `0x${string}`;
  amount: bigint;
  timestamp: bigint;
}) => {
  const { currentDay, currentWeek, currentMonth, currentYear } =
    getDates(timestamp);

  const promises = [];

  // Upsert currency slicer day
  promises.push(
    db
      .insert(currencySlicerDay)
      .values({
        slicerId,
        currencyId: currency,
        totalEarned: amount,
        day: currentDay,
      })
      .onConflictDoUpdate((row) => ({
        totalEarned: BigInt(row.totalEarned ?? 0n) + amount,
      }))
  );

  // Upsert currency slicer week
  promises.push(
    db
      .insert(currencySlicerWeek)
      .values({
        slicerId,
        currencyId: currency,
        totalEarned: amount,
        week: currentWeek,
      })
      .onConflictDoUpdate((row) => ({
        totalEarned: BigInt(row.totalEarned ?? 0n) + amount,
      }))
  );

  // Upsert currency slicer month
  promises.push(
    db
      .insert(currencySlicerMonth)
      .values({
        slicerId,
        currencyId: currency,
        totalEarned: amount,
        month: currentMonth,
      })
      .onConflictDoUpdate((row) => ({
        totalEarned: BigInt(row.totalEarned ?? 0n) + amount,
      }))
  );

  // Upsert currency slicer year
  promises.push(
    db
      .insert(currencySlicerYear)
      .values({
        slicerId,
        currencyId: currency,
        totalEarned: amount,
        year: currentYear,
      })
      .onConflictDoUpdate((row) => ({
        totalEarned: BigInt(row.totalEarned ?? 0n) + amount,
      }))
  );

  return promises;
};

const updateCurrencyTables = async ({
  db,
  slicerId,
  buyer,
  currency,
  amount,
  timestamp,
}: {
  db: Context["db"];
  slicerId: number;
  buyer: Address;
  currency: Address;
  amount: bigint;
  timestamp: bigint;
}) => {
  const buyerSlicerCurrencyPromise = db
    .insert(payeeSlicerCurrency)
    .values({
      payeeId: buyer,
      currencyId: currency,
      slicerId,
      paidForProducts: amount,
    })
    .onConflictDoUpdate((row) => ({
      paidForProducts: row.paidForProducts + amount,
    }));

  const buyerCurrencyPromise = db
    .insert(payeeCurrency)
    .values({
      payeeId: buyer,
      currencyId: currency,
      toWithdraw: 0n,
      toPayToProtocol: 0n,
      withdrawn: 0n,
      paidToProtocol: 0n,
      totalCreatorFees: 0n,
      totalReferralFees: 0n,
      totalReferralFeesUsd: 0n,
    })
    .onConflictDoNothing();

  const currencySlicerPromise = db
    .insert(currencySlicer)
    .values({
      slicerId,
      currencyId: currency,
      released: 0n,
      releasedToProtocol: 0n,
      releasedUsd: 0n,
      creatorFeePaid: 0n,
      referralFeePaid: 0n,
      totalEarned: amount,
    })
    .onConflictDoUpdate((row) => ({
      released: row.released + amount,
      releasedUsd: row.releasedUsd + amount,
      creatorFeePaid: row.creatorFeePaid + amount,
      referralFeePaid: row.referralFeePaid + amount,
      totalEarned: row.totalEarned + amount,
    }));

  const currencySlicerStatsPromise = updateCurrencySlicerStats({
    db,
    slicerId,
    currency,
    amount,
    timestamp,
  });

  return Promise.all([
    buyerSlicerCurrencyPromise,
    buyerCurrencyPromise,
    currencySlicerPromise,
    ...currencySlicerStatsPromise,
  ]);
};

const getReferralAmount = (amount: bigint, referralFee: bigint) =>
  referralFee !== 0n ? (amount * referralFee) / 10_000n : 0n;

ponder.on(
  "ProductsModule:ProductPaid(uint256 indexed slicerId, uint256 indexed productId, uint256 quantity, address indexed buyer, address currency, (uint256 eth, uint256 currency, uint256 ethExternalCall, uint256 currencyExternalCall) price)",
  async ({ event: { args, block, transaction }, context }) => {
    const { slicerId, productId, quantity, buyer, currency, price } = args;

    await handleProductPaid({
      context,
      transaction,
      timestamp: block.timestamp,
      slicerId: Number(slicerId),
      productId: Number(productId),
      quantity,
      buyer,
      currency,
      price,
    });
  }
);

ponder.on(
  "ProductsModule:ProductPaid(uint256 indexed slicerId, uint256 indexed productId, uint256 quantity, address indexed buyer, address currency, (uint256 eth, uint256 currency, uint256 ethExternalCall, uint256 currencyExternalCall) price, address referrer, uint256 parentSlicerId, uint256 parentProductId)",
  async ({ event: { args, block, transaction }, context }) => {
    const {
      slicerId,
      productId,
      quantity,
      buyer,
      currency,
      price,
      referrer,
      parentSlicerId,
      parentProductId,
    } = args;

    await handleProductPaid({
      context,
      transaction,
      timestamp: block.timestamp,
      slicerId: Number(slicerId),
      productId: Number(productId),
      quantity,
      buyer,
      currency,
      price,
      referrer,
      parentSlicerId: Number(parentSlicerId),
      parentProductId: Number(parentProductId),
    });
  }
);
