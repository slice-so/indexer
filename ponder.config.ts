import { createConfig, factory, mergeAbis } from "ponder"

import type { AbiEvent } from "viem"
import { AggregatorV3InterfaceAbi } from "./abis/common/AggregatorV3InterfaceAbi"
import { ERC1155 } from "./abis/common/ERC1155"
import { FundsModule, SlicerV1 } from "./abis/v1"
import { ProductsModuleV2, SliceCoreV2, SlicerV2 } from "./abis/v2"
import { ProductsModuleV3 } from "./abis/v3"
import { ProductsModuleV4 } from "./abis/v4"

const ProductsModuleAbi = mergeAbis([
	ProductsModuleV2,
	ProductsModuleV3,
	ProductsModuleV4
])
const SliceCoreAbi = mergeAbis([SliceCoreV2, ERC1155])
const SlicerAbi = mergeAbis([SlicerV1, SlicerV2])

export default createConfig({
	chains: { base: { id: 8453, rpc: process.env.PONDER_RPC_URL_8453 } },
	contracts: {
		FundsModule: {
			chain: "base",
			abi: FundsModule,
			startBlock: 1511944,
			address: "0x61bCd1ED11fC03C958A847A6687b1875f5eAcaaf"
		},
		SliceCore: {
			chain: "base",
			abi: SliceCoreAbi,
			startBlock: 1511944,
			address: "0x5Cef0380cE0aD3DAEefef8bDb85dBDeD7965adf9"
		},
		ProductsModule: {
			chain: "base",
			abi: ProductsModuleAbi,
			startBlock: 1511944,
			address: "0xb9d5B99d5D0fA04dD7eb2b0CD7753317C2ea1a84"
		},
		Slicer: {
			chain: "base",
			abi: SlicerAbi,
			startBlock: 1511944,
			address: factory({
				// The address of the factory contract that creates instances of this child contract.
				address: "0x5Cef0380cE0aD3DAEefef8bDb85dBDeD7965adf9",
				// The event emitted by the factory that announces a new instance of this child contract.
				event: SliceCoreAbi.find((x) => x.name === "TokenSliced") as AbiEvent,
				// The name of the parameter that contains the address of the new child contract.
				parameter: "slicerAddress"
			})
		},
		PriceFeed: {
			chain: "base",
			abi: AggregatorV3InterfaceAbi,
			startBlock: 1511944
		}
	}
})
