// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface IVibeText {
    error NotOwner();
    error InsufficientPayment();
    error InsufficientFunds();
    error WithdrawFailed();

    event TuneRequested(address indexed requester, string input, string country);
    event Withdrawn(address indexed owner, uint256 amount);
    event PriceChanged(uint256 newPrice);

    function requestTune(string memory _input, string memory _country) external payable;
    function changePrice(uint256 _newPrice) external;
    function withdraw(uint256 _amount) external;
    function pause() external;
    function unpause() external;

    function PRICE() external view returns (uint256);
    function owner() external view returns (address);
}
