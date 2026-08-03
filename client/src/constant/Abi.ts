export const VibeText_Abi = [
  // Custom Errors
  { type: "error", name: "AlreadyProcessed", inputs: [] },
  { type: "error", name: "InvalidAmount", inputs: [] },
  { type: "error", name: "NotAdmin", inputs: [] },
  { type: "error", name: "NotOwner", inputs: [] },
  { type: "error", name: "TransferFailed", inputs: [] },
  { type: "error", name: "TreasuryDepleted", inputs: [] },

  // Events
  { type: "event", name: "AdminAdded", inputs: [{ name: "admin", type: "address", indexed: true }] },
  { type: "event", name: "AdminRemoved", inputs: [{ name: "admin", type: "address", indexed: true }] },
  { type: "event", name: "Paused", inputs: [{ name: "account", type: "address", indexed: false }] },
  { type: "event", name: "TreasuryFunded", inputs: [{ name: "funder", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }] },
  { type: "event", name: "Unpaused", inputs: [{ name: "account", type: "address", indexed: false }] },
  { type: "event", name: "ValidatorRewarded", inputs: [{ name: "validator", type: "address", indexed: true }, { name: "rewardAmount", type: "uint256", indexed: false }, { name: "verificationId", type: "string", indexed: false }] },
  { type: "event", name: "Withdrawn", inputs: [{ name: "owner", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }] },

  // Read-Only Functions (View)
  { type: "function", name: "admins", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "paused", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "processedVerifications", stateMutability: "view", inputs: [{ name: "", type: "string" }], outputs: [{ type: "bool" }] },

  // State-Changing Functions
  { type: "function", name: "addAdmin", stateMutability: "nonpayable", inputs: [{ name: "_admin", type: "address" }], outputs: [] },
  { type: "function", name: "fundTreasury", stateMutability: "payable", inputs: [], outputs: [] },
  { type: "function", name: "pause", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "removeAdmin", stateMutability: "nonpayable", inputs: [{ name: "_admin", type: "address" }], outputs: [] },
  { type: "function", name: "rewardValidator", stateMutability: "nonpayable", inputs: [{ name: "_validator", type: "address" }, { name: "_amount", type: "uint256" }, { name: "_verificationId", type: "string" }], outputs: [] },
  { type: "function", name: "unpause", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "withdraw", stateMutability: "nonpayable", inputs: [{ name: "_amount", type: "uint256" }], outputs: [] },

  // Receive Ether
  { type: "receive", stateMutability: "payable" },
] as const;
