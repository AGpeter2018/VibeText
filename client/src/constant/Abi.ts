export const Abi = [
  // Constructor
  "constructor(address _owner)",

  // Errors
  "error AddressZero()",
  "error AlreadyProcessed()",
  "error InvalidAmount()",
  "error NotAdmin()",
  "error NotOwner()",
  "error NotPendingOwner()",
  "error ReentrantCall()",
  "error TransferFailed()",
  "error TreasuryDepleted()",

  // Events
  "event AdminAdded(address indexed admin)",
  "event AdminRemoved(address indexed admin)",
  "event OwnerAccepted(address indexed newOwner)",
  "event OwnerChanged(address indexed previousOwner, address indexed newOwner)",
  "event Paused(address account)",
  "event TreasuryFunded(address indexed funder, uint256 amount)",
  "event Unpaused(address account)",
  "event ValidatorRewarded(address indexed validator, uint256 rewardAmount, string verificationId)",
  "event Withdrawn(address indexed owner, uint256 amount)",

  // Read-only functions
  "function admins(address) view returns (bool)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",
  "function pendingOwner() view returns (address)",
  "function processedVerifications(string) view returns (bool)",

  // State-changing functions
  "function acceptOwnership()",
  "function addAdmin(address _admin)",
  "function fundTreasury() payable",
  "function nominateOwner(address _newOwner)",
  "function pause()",
  "function removeAdmin(address _admin)",
  "function rewardValidator(address _validator, uint256 _amount, string _verificationId)",
  "function unpause()",
  "function withdraw(uint256 _amount)"
];
