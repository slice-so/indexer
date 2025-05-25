export const ProductsModule = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [],
    name: "ActiveListing",
    type: "error"
  },
  {
    inputs: [],
    name: "ExceedsMaxValue",
    type: "error"
  },
  {
    inputs: [],
    name: "InexistentPool",
    type: "error"
  },
  {
    inputs: [],
    name: "InexistentProduct",
    type: "error"
  },
  {
    inputs: [],
    name: "Invalid",
    type: "error"
  },
  {
    inputs: [],
    name: "InvalidCategory",
    type: "error"
  },
  {
    inputs: [],
    name: "InvalidProductType",
    type: "error"
  },
  {
    inputs: [],
    name: "NoDelegatecall",
    type: "error"
  },
  {
    inputs: [],
    name: "NotAuthorized",
    type: "error"
  },
  {
    inputs: [],
    name: "NotPurchased",
    type: "error"
  },
  {
    inputs: [],
    name: "NotSuccessful",
    type: "error"
  },
  {
    inputs: [],
    name: "StoreNotOpen",
    type: "error"
  },
  {
    inputs: [],
    name: "TooSoon",
    type: "error"
  },
  {
    inputs: [],
    name: "WrongCurrency",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "previousAdmin",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "newAdmin",
        type: "address"
      }
    ],
    name: "AdminChanged",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "beacon",
        type: "address"
      }
    ],
    name: "BeaconUpgraded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "categoryId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "parentCategoryId",
        type: "uint16"
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string"
      }
    ],
    name: "CategorySet",
    type: "event"
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
        indexed: true,
        internalType: "address",
        name: "contractAddress",
        type: "address"
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "currentAmount",
        type: "uint256"
      }
    ],
    name: "ERC1155ListingChanged",
    type: "event"
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
        indexed: true,
        internalType: "address",
        name: "contractAddress",
        type: "address"
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isActive",
        type: "bool"
      }
    ],
    name: "ERC721ListingChanged",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "currency",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address"
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "string",
        name: "description",
        type: "string"
      }
    ],
    name: "ExtraCostPaid",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8"
      }
    ],
    name: "Initialized",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "Paused",
    type: "event"
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
        indexed: true,
        internalType: "uint256",
        name: "productId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "address",
        name: "creator",
        type: "address"
      },
      {
        components: [
          {
            components: [
              {
                internalType: "uint128",
                name: "subSlicerId",
                type: "uint128"
              },
              {
                internalType: "uint32",
                name: "subProductId",
                type: "uint32"
              }
            ],
            internalType: "struct SubSlicerProduct[]",
            name: "subSlicerProducts",
            type: "tuple[]"
          },
          {
            components: [
              {
                internalType: "uint248",
                name: "value",
                type: "uint248"
              },
              {
                internalType: "bool",
                name: "dynamicPricing",
                type: "bool"
              },
              {
                internalType: "address",
                name: "externalAddress",
                type: "address"
              },
              {
                internalType: "address",
                name: "currency",
                type: "address"
              }
            ],
            internalType: "struct CurrencyPrice[]",
            name: "currencyPrices",
            type: "tuple[]"
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes"
          },
          {
            internalType: "bytes",
            name: "purchaseData",
            type: "bytes"
          },
          {
            internalType: "uint32",
            name: "availableUnits",
            type: "uint32"
          },
          {
            internalType: "uint16",
            name: "categoryId",
            type: "uint16"
          },
          {
            internalType: "uint16",
            name: "productTypeId",
            type: "uint16"
          },
          {
            internalType: "uint8",
            name: "maxUnitsPerBuyer",
            type: "uint8"
          },
          {
            internalType: "bool",
            name: "isFree",
            type: "bool"
          },
          {
            internalType: "bool",
            name: "isInfinite",
            type: "bool"
          },
          {
            internalType: "bool",
            name: "isExternalCallPaymentRelative",
            type: "bool"
          },
          {
            internalType: "bool",
            name: "isExternalCallPreferredToken",
            type: "bool"
          },
          {
            internalType: "uint256",
            name: "referralFeeProduct",
            type: "uint256"
          }
        ],
        indexed: false,
        internalType: "struct ProductParams",
        name: "params",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "data",
            type: "bytes"
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "externalAddress",
            type: "address"
          },
          {
            internalType: "bytes4",
            name: "checkFunctionSignature",
            type: "bytes4"
          },
          {
            internalType: "bytes4",
            name: "execFunctionSignature",
            type: "bytes4"
          }
        ],
        indexed: false,
        internalType: "struct Function",
        name: "externalCall",
        type: "tuple"
      }
    ],
    name: "ProductAdded",
    type: "event"
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
        indexed: true,
        internalType: "uint256",
        name: "productId",
        type: "uint256"
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "data",
            type: "bytes"
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "externalAddress",
            type: "address"
          },
          {
            internalType: "bytes4",
            name: "checkFunctionSignature",
            type: "bytes4"
          },
          {
            internalType: "bytes4",
            name: "execFunctionSignature",
            type: "bytes4"
          }
        ],
        indexed: false,
        internalType: "struct Function",
        name: "externalCall",
        type: "tuple"
      }
    ],
    name: "ProductExternalCallUpdated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "slicerId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "productId",
            type: "uint256"
          },
          {
            internalType: "uint8",
            name: "newMaxUnits",
            type: "uint8"
          },
          {
            internalType: "bool",
            name: "isFree",
            type: "bool"
          },
          {
            internalType: "bool",
            name: "isInfinite",
            type: "bool"
          },
          {
            internalType: "uint32",
            name: "newUnits",
            type: "uint32"
          },
          {
            internalType: "uint256",
            name: "referralFeeProduct",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "categoryId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "productTypeId",
            type: "uint256"
          }
        ],
        indexed: false,
        internalType: "struct EditProductParams",
        name: "params",
        type: "tuple"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newUnits",
        type: "uint256"
      },
      {
        components: [
          {
            internalType: "uint248",
            name: "value",
            type: "uint248"
          },
          {
            internalType: "bool",
            name: "dynamicPricing",
            type: "bool"
          },
          {
            internalType: "address",
            name: "externalAddress",
            type: "address"
          },
          {
            internalType: "address",
            name: "currency",
            type: "address"
          }
        ],
        indexed: false,
        internalType: "struct CurrencyPrice[]",
        name: "currencyPrices",
        type: "tuple[]"
      }
    ],
    name: "ProductInfoChanged",
    type: "event"
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
        indexed: true,
        internalType: "uint256",
        name: "productId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "quantity",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "currency",
        type: "address"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "eth",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "currency",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "ethExternalCall",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "currencyExternalCall",
            type: "uint256"
          }
        ],
        indexed: false,
        internalType: "struct Price",
        name: "price",
        type: "tuple"
      },
      {
        indexed: false,
        internalType: "address",
        name: "referrer",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "parentSlicerId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "parentProductId",
        type: "uint256"
      }
    ],
    name: "ProductPaid",
    type: "event"
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
        indexed: true,
        internalType: "uint256",
        name: "productId",
        type: "uint256"
      }
    ],
    name: "ProductRemoved",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "slicerId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "productTypeId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "parentProductTypeId",
        type: "uint16"
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string"
      }
    ],
    name: "ProductTypeSet",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address"
      }
    ],
    name: "PurchaseMade",
    type: "event"
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
        internalType: "uint256",
        name: "ethToRelease",
        type: "uint256"
      }
    ],
    name: "ReleasedToSlicer",
    type: "event"
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
        name: "isStoreClosed",
        type: "bool"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "referralFeeStore",
        type: "uint256"
      }
    ],
    name: "StoreConfigChanged",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "Unpaused",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address"
      }
    ],
    name: "Upgraded",
    type: "event"
  },
  {
    inputs: [],
    name: "MINT_PRODUCT_AMOUNT",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "categoryId",
        type: "uint256"
      },
      {
        internalType: "uint16",
        name: "parentCategoryId",
        type: "uint16"
      },
      {
        internalType: "string",
        name: "name",
        type: "string"
      }
    ],
    name: "_setCategory",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "slicerId",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "isClosed",
        type: "bool"
      },
      {
        internalType: "uint256",
        name: "referralFeeStore",
        type: "uint256"
      }
    ],
    name: "_setStoreConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "slicerId",
        type: "uint256"
      },
      {
        components: [
          {
            components: [
              {
                internalType: "uint128",
                name: "subSlicerId",
                type: "uint128"
              },
              {
                internalType: "uint32",
                name: "subProductId",
                type: "uint32"
              }
            ],
            internalType: "struct SubSlicerProduct[]",
            name: "subSlicerProducts",
            type: "tuple[]"
          },
          {
            components: [
              {
                internalType: "uint248",
                name: "value",
                type: "uint248"
              },
              {
                internalType: "bool",
                name: "dynamicPricing",
                type: "bool"
              },
              {
                internalType: "address",
                name: "externalAddress",
                type: "address"
              },
              {
                internalType: "address",
                name: "currency",
                type: "address"
              }
            ],
            internalType: "struct CurrencyPrice[]",
            name: "currencyPrices",
            type: "tuple[]"
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes"
          },
          {
            internalType: "bytes",
            name: "purchaseData",
            type: "bytes"
          },
          {
            internalType: "uint32",
            name: "availableUnits",
            type: "uint32"
          },
          {
            internalType: "uint16",
            name: "categoryId",
            type: "uint16"
          },
          {
            internalType: "uint16",
            name: "productTypeId",
            type: "uint16"
          },
          {
            internalType: "uint8",
            name: "maxUnitsPerBuyer",
            type: "uint8"
          },
          {
            internalType: "bool",
            name: "isFree",
            type: "bool"
          },
          {
            internalType: "bool",
            name: "isInfinite",
            type: "bool"
          },
          {
            internalType: "bool",
            name: "isExternalCallPaymentRelative",
            type: "bool"
          },
          {
            internalType: "bool",
            name: "isExternalCallPreferredToken",
            type: "bool"
          },
          {
            internalType: "uint256",
            name: "referralFeeProduct",
            type: "uint256"
          }
        ],
        internalType: "struct ProductParams",
        name: "params",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "data",
            type: "bytes"
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "externalAddress",
            type: "address"
          },
          {
            internalType: "bytes4",
            name: "checkFunctionSignature",
            type: "bytes4"
          },
          {
            internalType: "bytes4",
            name: "execFunctionSignature",
            type: "bytes4"
          }
        ],
        internalType: "struct Function",
        name: "externalCall_",
        type: "tuple"
      }
    ],
    name: "addProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "slicerId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "productId",
        type: "uint256"
      }
    ],
    name: "availableUnits",
    outputs: [
      {
        internalType: "uint256",
        name: "units",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "isInfinite",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "categories",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string"
      },
      {
        internalType: "uint16",
        name: "parentCategoryId",
        type: "uint16"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "fundsModule",
    outputs: [
      {
        internalType: "contract IFundsModule",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "slicerId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "productId",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "isProductOwner",
    outputs: [
      {
        internalType: "bool",
        name: "isAllowed",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]"
      }
    ],
    name: "multicall",
    outputs: [
      {
        internalType: "bytes[]",
        name: "results",
        type: "bytes[]"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "slicerId",
        type: "uint256"
      }
    ],
    name: "nextProductId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "paused",
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
        components: [
          {
            internalType: "address",
            name: "buyer",
            type: "address"
          },
          {
            internalType: "uint128",
            name: "slicerId",
            type: "uint128"
          },
          {
            internalType: "uint32",
            name: "quantity",
            type: "uint32"
          },
          {
            internalType: "address",
            name: "currency",
            type: "address"
          },
          {
            internalType: "uint32",
            name: "productId",
            type: "uint32"
          },
          {
            internalType: "bytes",
            name: "buyerCustomData",
            type: "bytes"
          }
        ],
        internalType: "struct PurchaseParams[]",
        name: "purchases",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "address",
            name: "recipient",
            type: "address"
          },
          {
            internalType: "uint128",
            name: "slicerId",
            type: "uint128"
          },
          {
            internalType: "uint128",
            name: "amount",
            type: "uint128"
          },
          {
            internalType: "address",
            name: "currency",
            type: "address"
          },
          {
            internalType: "string",
            name: "description",
            type: "string"
          }
        ],
        internalType: "struct ExtraCost[]",
        name: "extraCosts",
        type: "tuple[]"
      },
      {
        internalType: "address",
        name: "referrer",
        type: "address"
      }
    ],
    name: "payProducts",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "buyer",
            type: "address"
          },
          {
            internalType: "uint128",
            name: "slicerId",
            type: "uint128"
          },
          {
            internalType: "uint32",
            name: "quantity",
            type: "uint32"
          },
          {
            internalType: "address",
            name: "currency",
            type: "address"
          },
          {
            internalType: "uint32",
            name: "productId",
            type: "uint32"
          },
          {
            internalType: "bytes",
            name: "buyerCustomData",
            type: "bytes"
          }
        ],
        internalType: "struct PurchaseParams[]",
        name: "purchases",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "address",
            name: "recipient",
            type: "address"
          },
          {
            internalType: "uint128",
            name: "slicerId",
            type: "uint128"
          },
          {
            internalType: "uint128",
            name: "amount",
            type: "uint128"
          },
          {
            internalType: "address",
            name: "currency",
            type: "address"
          },
          {
            internalType: "string",
            name: "description",
            type: "string"
          }
        ],
        internalType: "struct ExtraCost[]",
        name: "extraCosts",
        type: "tuple[]"
      },
      {
        internalType: "address",
        name: "referrer",
        type: "address"
      },
      {
        internalType: "address",
        name: "buyer",
        type: "address"
      }
    ],
    name: "payProducts",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "buyer",
            type: "address"
          },
          {
            internalType: "uint128",
            name: "slicerId",
            type: "uint128"
          },
          {
            internalType: "uint32",
            name: "quantity",
            type: "uint32"
          },
          {
            internalType: "address",
            name: "currency",
            type: "address"
          },
          {
            internalType: "uint32",
            name: "productId",
            type: "uint32"
          },
          {
            internalType: "bytes",
            name: "buyerCustomData",
            type: "bytes"
          }
        ],
        internalType: "struct PurchaseParams[]",
        name: "purchases",
        type: "tuple[]"
      }
    ],
    name: "payProducts",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "buyer",
            type: "address"
          },
          {
            internalType: "uint128",
            name: "slicerId",
            type: "uint128"
          },
          {
            internalType: "uint32",
            name: "quantity",
            type: "uint32"
          },
          {
            internalType: "address",
            name: "currency",
            type: "address"
          },
          {
            internalType: "uint32",
            name: "productId",
            type: "uint32"
          },
          {
            internalType: "bytes",
            name: "buyerCustomData",
            type: "bytes"
          }
        ],
        internalType: "struct PurchaseParams[]",
        name: "purchases",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "address",
            name: "from",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "validAfter",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "validBefore",
            type: "uint256"
          },
          {
            internalType: "bytes32",
            name: "nonce",
            type: "bytes32"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct PayWithAuthorizationParams",
        name: "authorizationParams",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "address",
            name: "recipient",
            type: "address"
          },
          {
            internalType: "uint128",
            name: "slicerId",
            type: "uint128"
          },
          {
            internalType: "uint128",
            name: "amount",
            type: "uint128"
          },
          {
            internalType: "address",
            name: "currency",
            type: "address"
          },
          {
            internalType: "string",
            name: "description",
            type: "string"
          }
        ],
        internalType: "struct ExtraCost[]",
        name: "extraCosts",
        type: "tuple[]"
      },
      {
        internalType: "address",
        name: "referrer",
        type: "address"
      },
      {
        internalType: "contract IERC20Permit",
        name: "currency",
        type: "address"
      }
    ],
    name: "payWithAuthorization",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "buyer",
            type: "address"
          },
          {
            internalType: "uint128",
            name: "slicerId",
            type: "uint128"
          },
          {
            internalType: "uint32",
            name: "quantity",
            type: "uint32"
          },
          {
            internalType: "address",
            name: "currency",
            type: "address"
          },
          {
            internalType: "uint32",
            name: "productId",
            type: "uint32"
          },
          {
            internalType: "bytes",
            name: "buyerCustomData",
            type: "bytes"
          }
        ],
        internalType: "struct PurchaseParams[]",
        name: "purchases",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "address",
            name: "from",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "validAfter",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "validBefore",
            type: "uint256"
          },
          {
            internalType: "bytes32",
            name: "nonce",
            type: "bytes32"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct PayWithAuthorizationParams",
        name: "authorizationParams",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "address",
            name: "recipient",
            type: "address"
          },
          {
            internalType: "uint128",
            name: "slicerId",
            type: "uint128"
          },
          {
            internalType: "uint128",
            name: "amount",
            type: "uint128"
          },
          {
            internalType: "address",
            name: "currency",
            type: "address"
          },
          {
            internalType: "string",
            name: "description",
            type: "string"
          }
        ],
        internalType: "struct ExtraCost[]",
        name: "extraCosts",
        type: "tuple[]"
      },
      {
        internalType: "address",
        name: "referrer",
        type: "address"
      }
    ],
    name: "payWithAuthorization",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "priceFeed",
    outputs: [
      {
        internalType: "contract IPriceFeed",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "slicerId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "productId",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "currency",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "quantity",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "buyer",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "productPrice",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "eth",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "currency",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "ethExternalCall",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "currencyExternalCall",
            type: "uint256"
          }
        ],
        internalType: "struct Price",
        name: "price",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "productTypes",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string"
      },
      {
        internalType: "uint16",
        name: "parentProductTypeId",
        type: "uint16"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "proxiableUUID",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "slicerId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "productId",
        type: "uint256"
      }
    ],
    name: "removeProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "slicerId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "productId",
            type: "uint256"
          },
          {
            internalType: "uint8",
            name: "newMaxUnits",
            type: "uint8"
          },
          {
            internalType: "bool",
            name: "isFree",
            type: "bool"
          },
          {
            internalType: "bool",
            name: "isInfinite",
            type: "bool"
          },
          {
            internalType: "uint32",
            name: "newUnits",
            type: "uint32"
          },
          {
            internalType: "uint256",
            name: "referralFeeProduct",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "categoryId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "productTypeId",
            type: "uint256"
          }
        ],
        internalType: "struct EditProductParams",
        name: "params",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "uint248",
            name: "value",
            type: "uint248"
          },
          {
            internalType: "bool",
            name: "dynamicPricing",
            type: "bool"
          },
          {
            internalType: "address",
            name: "externalAddress",
            type: "address"
          },
          {
            internalType: "address",
            name: "currency",
            type: "address"
          }
        ],
        internalType: "struct CurrencyPrice[]",
        name: "currencyPrices",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "data",
            type: "bytes"
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "externalAddress",
            type: "address"
          },
          {
            internalType: "bytes4",
            name: "checkFunctionSignature",
            type: "bytes4"
          },
          {
            internalType: "bytes4",
            name: "execFunctionSignature",
            type: "bytes4"
          }
        ],
        internalType: "struct Function",
        name: "externalCall_",
        type: "tuple"
      }
    ],
    name: "setProductInfo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "slicerId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "productTypeId",
        type: "uint256"
      },
      {
        internalType: "uint16",
        name: "parentProductTypeId",
        type: "uint16"
      },
      {
        internalType: "string",
        name: "name",
        type: "string"
      }
    ],
    name: "setProductType",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "sliceCore",
    outputs: [
      {
        internalType: "contract ISliceCore",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address"
      }
    ],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "slicerId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "productId",
        type: "uint256"
      }
    ],
    name: "validatePurchase",
    outputs: [
      {
        internalType: "uint256",
        name: "purchases",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "purchaseData",
        type: "bytes"
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
        internalType: "uint256",
        name: "slicerId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "productId",
        type: "uint256"
      }
    ],
    name: "validatePurchaseUnits",
    outputs: [
      {
        internalType: "uint256",
        name: "purchases",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const
