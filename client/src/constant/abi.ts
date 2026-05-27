export const Abi = [
  // Constructor
  "constructor(address _owner)",

  // Errors
  "error InsufficientFunds()",
  "error InsufficientPayment()",
  "error NotOwner()",
  "error WithdrawFailed()",

  // Events
  "event Paused(address account)",
  "event PriceChanged(uint256 newPrice)",
  "event TuneRequested(address indexed requester, string input, string country)",
  "event Unpaused(address account)",
  "event Withdrawn(address indexed owner, uint256 amount)",

  // Read Functions
  "function PRICE() view returns (uint256)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",
   // Write Functions
  "function changePrice(uint256 _newPrice)",
  "function pause()",
  "function requestTune(string _input, string _country) payable",
  "function unpause()",
  "function withdraw(uint256 _amount)"
];
