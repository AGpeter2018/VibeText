export const VIBETEXT_ABI = [
    "function rewardValidator(address _validator, uint256 _amount, string memory _verificationId) public",
    "function admins(address) public view returns (bool)",
    "event ValidatorRewarded(address indexed validator, uint256 rewardAmount, string verificationId)",

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
    
];