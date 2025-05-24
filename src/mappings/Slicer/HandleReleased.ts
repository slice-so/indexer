import { type Context, ponder } from "ponder:registry"
import { payeeCurrency, releaseEvent } from "ponder:schema"
import { currencySlicer } from "@/schema/tables"
import { getSlicerId, getUsdcAmount, upsertPayee } from "@/utils"

const handleReleased = async ({
	context,
	slicerAddress,
	payee,
	currency,
	amountReleased,
	protocolPayment,
	timestamp,
	creatorPayment = 0n
}: {
	context: Context
	slicerAddress: `0x${string}`
	payee: `0x${string}`
	currency: `0x${string}`
	amountReleased: bigint
	protocolPayment: bigint
	timestamp: bigint
	creatorPayment?: bigint
}) => {
	const { db } = context

	const [slicerId, amountReleasedUsd] = await Promise.all([
		getSlicerId(slicerAddress, db),
		getUsdcAmount(context, currency, amountReleased)
	])

	const promiseCurrencySlicer = db
		.insert(currencySlicer)
		.values({
			currencyId: currency,
			slicerId: slicerId,
			released: amountReleased,
			releasedUsd: amountReleasedUsd,
			releasedToProtocol: protocolPayment,
			creatorFeePaid: creatorPayment,
			totalEarned: 0n,
			referralFeePaid: 0n
		})
		.onConflictDoUpdate((row) => ({
			released: row.released + amountReleased,
			releasedUsd: row.releasedUsd + amountReleasedUsd,
			releasedToProtocol: row.releasedToProtocol + protocolPayment,
			creatorFeePaid: row.creatorFeePaid + creatorPayment
		}))

	const promiseReleaseEvent = db.insert(releaseEvent).values({
		slicerId,
		currencyId: currency,
		payeeId: payee,
		amountReleased,
		amountReleasedUsd,
		timestamp: timestamp
	})

	let promisePayee = null
	let promisePayeeCurrency = null
	if (creatorPayment > 0n) {
		promisePayee = upsertPayee(db, payee)

		promisePayeeCurrency = db
			.insert(payeeCurrency)
			.values({
				payeeId: payee,
				currencyId: currency,
				toWithdraw: 0n,
				toPayToProtocol: 0n,
				withdrawn: 0n,
				paidToProtocol: 0n,
				totalReferralFees: 0n,
				totalReferralFeesUsd: 0n,
				totalCreatorFees: creatorPayment
			})
			.onConflictDoUpdate((row) => ({
				totalCreatorFees: row.totalCreatorFees + creatorPayment
			}))
	}

	await Promise.all([
		promiseCurrencySlicer,
		promiseReleaseEvent,
		promisePayee,
		promisePayeeCurrency
	])
}

ponder.on(
	"Slicer:Released(address indexed payee, address indexed currency, uint256 amountReleased, uint256 protocolPayment)",
	async ({ event, context }) => {
		const { payee, currency, amountReleased, protocolPayment } = event.args

		await handleReleased({
			context,
			slicerAddress: event.log.address,
			payee,
			currency,
			amountReleased,
			protocolPayment,
			timestamp: event.block.timestamp
		})
	}
)

ponder.on(
	"Slicer:Released(address indexed payee, address indexed currency, uint256 amountReleased, uint256 creatorPayment, uint256 protocolPayment)",
	async ({ event, context }) => {
		const { payee, currency, amountReleased, creatorPayment, protocolPayment } =
			event.args

		await handleReleased({
			context,
			slicerAddress: event.log.address,
			payee,
			currency,
			amountReleased,
			protocolPayment,
			creatorPayment,
			timestamp: event.block.timestamp
		})
	}
)
