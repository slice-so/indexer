import type { Context } from "ponder:registry"
import { zeroAddress } from "viem"

const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
const eurcAddress = "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42"

export async function getUsdcAmount(
  context: Context,
  currencyAddress: `0x${string}`,
  amount: bigint
): Promise<bigint> {
  if (amount === 0n) {
    return 0n
  }

  if (currencyAddress.toLowerCase() === usdcAddress.toLowerCase()) {
    return amount
  }

  if (
    currencyAddress.toLowerCase() === zeroAddress ||
    currencyAddress.toLowerCase() === eurcAddress.toLowerCase()
  ) {
    const { client, contracts } = context
    const { PriceFeed } = contracts

    const priceFeedAddress =
      currencyAddress === zeroAddress
        ? "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"
        : "0xDAe398520e2B67cd3f27aeF9Cf14D93D927f8250"

    try {
      // Get latest price (in USD with 8 decimals)
      const priceResult = await client.readContract({
        address: priceFeedAddress,
        abi: PriceFeed.abi,
        functionName: "latestRoundData"
      })

      if (!priceResult) {
        return 0n
      }

      const price = priceResult[1] // Get the answer (price)

      // Convert amount to USDC (6 decimals)
      // price is in USD with 8 decimals, we need to:
      // 1. Multiply amount by price
      // 2. Divide by 10 ** decimals
      // 3. Divide by further 10^2 to convert from 8 decimals to 6 decimals (USDC)
      return (
        (amount * price) /
        (currencyAddress.toLowerCase() === zeroAddress
          ? 10n ** 20n // 18 + 2 decimals
          : 10n ** 8n) // 6 + 2 decimals
      )
    } catch {
      return 0n
    }
  } else {
    // TODO: Implement price feed
    // const priceFeedAddress = Address.fromString("")
    return 0n
  }
}
