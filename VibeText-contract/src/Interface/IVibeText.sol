// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface IVibeText {
    error NotOwner();
    error NotAdmin();
    error TreasuryDepleted();
    error TransferFailed();
    error InvalidAmount();
    error AlreadyProcessed();

    event TreasuryFunded(address indexed funder, uint256 amount);
    event ValidatorRewarded(address indexed validator, uint256 rewardAmount, string verificationId);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event Withdrawn(address indexed owner, uint256 amount);

    function fundTreasury() external payable;
    function rewardValidator(address _validator, uint256 _amount, string memory _verificationId) external;
    function addAdmin(address _admin) external;
    function removeAdmin(address _admin) external;
    function withdraw(uint256 _amount) external;
    function pause() external;
    function unpause() external;

    function owner() external view returns (address);
    function admins(address _admin) external view returns (bool);
    function processedVerifications(string memory _id) external view returns (bool);
}
