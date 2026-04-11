// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {PauseModule} from "./Module/PauseModule.sol";
import {IVibeText} from "./Interface/IVibeText.sol";

contract VibeText is IVibeText, PauseModule {

   address public owner;
   uint256 public PRICE = 0.01 ether;

   constructor(address _owner) {
      owner = _owner;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    function requestTune(string memory _input, string memory _country) public payable whenNotPaused {

        if (msg.value < PRICE) {
            revert InsufficientPayment();
        }

        emit TuneRequested(msg.sender, _input, _country);
    }

    function changePrice(uint256 _newPrice) public onlyOwner {

        PRICE = _newPrice;

        emit PriceChanged(_newPrice);
    }

    function withdraw(uint256 _amount) public onlyOwner {

        if (address(this).balance < _amount) {
            revert InsufficientFunds();
        }

        (bool success, ) = payable(owner).call{value: _amount}("");

        if (!success) {
            revert WithdrawFailed();
        }

        emit Withdrawn(owner, _amount);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
