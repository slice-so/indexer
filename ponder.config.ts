import { createConfig, mergeAbis } from "@ponder/core"
import { http } from "viem"

import { FundsModule as FundsModuleAbi, SlicerV1 } from "./abis/v1"
import { ProductsModuleV2, SliceCoreV2, SlicerV2 } from "./abis/v2"
import { ProductsModuleV3 } from "./abis/v3"

const ProductsModuleAbi = mergeAbis([ProductsModuleV2, ProductsModuleV3])
const SliceCoreAbi = SliceCoreV2
const SlicerAbi = mergeAbis([SlicerV1, SlicerV2])

export default createConfig({
  networks: {
    base: { chainId: 8453, transport: http(process.env.PONDER_RPC_URL_8453) }
  },
  contracts: {
    FundsModule: {
      network: "base",
      address: "0x61bCd1ED11fC03C958A847A6687b1875f5eAcaaf",
      abi: FundsModuleAbi,
      startBlock: 1511944
    },
    SliceCore: {
      network: "base",
      address: "0x5Cef0380cE0aD3DAEefef8bDb85dBDeD7965adf9",
      abi: SliceCoreAbi,
      startBlock: 1511944
    },
    ProductsModule: {
      network: "base",
      address: "0xb9d5B99d5D0fA04dD7eb2b0CD7753317C2ea1a84",
      abi: ProductsModuleAbi,
      startBlock: 1511944
    },
    Slicer: {
      abi: SlicerAbi,
      network: "base",
      factory: {
        // The address of the factory contract that creates instances of this child contract.
        address: "0x5Cef0380cE0aD3DAEefef8bDb85dBDeD7965adf9",
        // The event emitted by the factory that announces a new instance of this child contract.
        event: SliceCoreAbi.find((x) => x.name === "TokenSliced")!,
        // The name of the parameter that contains the address of the new child contract.
        parameter: "slicerAddress"
      },
      startBlock: 1511944
    }
  }
})
