export const Slicer = [
	{
		inputs: [],
		name: "Invalid",
		type: "error"
	},
	{
		inputs: [],
		name: "NotAuthorized",
		type: "error"
	},
	{
		inputs: [],
		name: "NotSuccessful",
		type: "error"
	},
	{
		inputs: [],
		name: "PaymentLoop",
		type: "error"
	},
	{
		inputs: [],
		name: "ReentrancyBlock",
		type: "error"
	},
	{
		inputs: [],
		name: "releaseLocked",
		type: "error"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "slicerId",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "bool",
				name: "addChildSlicerMode",
				type: "bool"
			}
		],
		name: "ChildSlicerSet",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address[]",
				name: "currencies",
				type: "address[]"
			}
		],
		name: "CurrenciesAdded",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "bool",
				name: "customFeeActive",
				type: "bool"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "customFee",
				type: "uint256"
			}
		],
		name: "CustomFeeSet",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "contractAddress",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256[]",
				name: "tokenIds",
				type: "uint256[]"
			},
			{
				indexed: false,
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		name: "ERC1155BatchReceived",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "contractAddress",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "ERC1155Received",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "contractAddress",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "ERC721Received",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "payee",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "currency",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amountReleased",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "protocolPayment",
				type: "uint256"
			}
		],
		name: "Released",
		type: "event"
	},
	{
		inputs: [
			{
				internalType: "address[]",
				name: "currencies",
				type: "address[]"
			}
		],
		name: "_addCurrencies",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "buyer",
				type: "address"
			},
			{
				internalType: "address",
				name: "contractAddress",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "quantity",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "_handle1155Purchase",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "buyer",
				type: "address"
			},
			{
				internalType: "address",
				name: "contractAddress",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "_handle721Purchase",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "tokenId_",
				type: "uint256"
			},
			{
				internalType: "uint8",
				name: "flags_",
				type: "uint8"
			},
			{
				internalType: "address",
				name: "slicerCreator_",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "minimumShares_",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "releaseTimelock_",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "currencies_",
				type: "address[]"
			}
		],
		name: "_initialize",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				internalType: "address",
				name: "currency",
				type: "address"
			}
		],
		name: "_releaseFromFundsModule",
		outputs: [
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "protocolPayment",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				internalType: "address",
				name: "currency",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "accountSlices",
				type: "uint256"
			}
		],
		name: "_releaseFromSliceCore",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "id",
				type: "uint256"
			},
			{
				internalType: "bool",
				name: "isAdded",
				type: "bool"
			}
		],
		name: "_setChildSlicer",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bool",
				name: "customFeeActive",
				type: "bool"
			},
			{
				internalType: "uint256",
				name: "customFee",
				type: "uint256"
			}
		],
		name: "_setCustomFee",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "totalShares",
				type: "uint256"
			}
		],
		name: "_setTotalShares",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address payable",
				name: "sender",
				type: "address"
			},
			{
				internalType: "address",
				name: "receiver",
				type: "address"
			},
			{
				internalType: "bool",
				name: "toRelease",
				type: "bool"
			},
			{
				internalType: "uint256",
				name: "senderShares",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "transferredShares",
				type: "uint256"
			}
		],
		name: "_updatePayees",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address payable[]",
				name: "accounts",
				type: "address[]"
			},
			{
				internalType: "int32[]",
				name: "tokensDiffs",
				type: "int32[]"
			},
			{
				internalType: "uint32",
				name: "totalSupply",
				type: "uint32"
			}
		],
		name: "_updatePayeesReslice",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "currency",
				type: "address"
			}
		],
		name: "acceptsCurrency",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address[]",
				name: "accounts",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "currency",
				type: "address"
			},
			{
				internalType: "bool",
				name: "withdraw",
				type: "bool"
			}
		],
		name: "batchReleaseAccounts",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [],
		name: "getFee",
		outputs: [
			{
				internalType: "uint256",
				name: "fee",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "payee",
				type: "address"
			}
		],
		name: "isPayeeAllowed",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			},
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "uint256[]",
				name: "tokenIds",
				type: "uint256[]"
			},
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			},
			{
				internalType: "bytes",
				name: "",
				type: "bytes"
			}
		],
		name: "onERC1155BatchReceived",
		outputs: [
			{
				internalType: "bytes4",
				name: "",
				type: "bytes4"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			},
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "",
				type: "bytes"
			}
		],
		name: "onERC1155Received",
		outputs: [
			{
				internalType: "bytes4",
				name: "",
				type: "bytes4"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			},
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "",
				type: "bytes"
			}
		],
		name: "onERC721Received",
		outputs: [
			{
				internalType: "bytes4",
				name: "",
				type: "bytes4"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				internalType: "address",
				name: "currency",
				type: "address"
			},
			{
				internalType: "bool",
				name: "withdraw",
				type: "bool"
			}
		],
		name: "release",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [],
		name: "slicerInfo",
		outputs: [
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "minimumShares",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "creator",
				type: "address"
			},
			{
				internalType: "bool",
				name: "isImmutable",
				type: "bool"
			},
			{
				internalType: "bool",
				name: "currenciesControlled",
				type: "bool"
			},
			{
				internalType: "bool",
				name: "productsControlled",
				type: "bool"
			},
			{
				internalType: "bool",
				name: "acceptsAllCurrencies",
				type: "bool"
			},
			{
				internalType: "address[]",
				name: "currencies",
				type: "address[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes4",
				name: "interfaceId",
				type: "bytes4"
			}
		],
		name: "supportsInterface",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				internalType: "address",
				name: "currency",
				type: "address"
			}
		],
		name: "unreleased",
		outputs: [
			{
				internalType: "uint256",
				name: "unreleasedAmount",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		stateMutability: "payable",
		type: "receive"
	}
] as const
