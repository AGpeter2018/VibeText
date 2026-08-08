// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VibeText} from "../src/VibeText.sol";
import {IVibeText} from "../src/Interface/IVibeText.sol";

contract VibeTextTest is Test {
    VibeText public vibeText;

    address public owner = address(0x123);
    address public user = address(0x456);

    event Withdrawn(address indexed owner, uint256 amount);
    event OwnerChanged(address indexed previousOwner, address indexed newOwner);
    event OwnerAccepted(address indexed newOwner);
    event ValidatorRewarded(address indexed validator, uint256 rewardAmount, string verificationId);

    function setUp() public {
        vm.deal(user, 10 ether);
        vm.deal(owner, 10 ether);
        vibeText = new VibeText(owner);
    }

    function test_ownerAndInitialAdmin() public {
        assertEq(owner, vibeText.owner());
        assertTrue(vibeText.admins(owner));
        assertFalse(vibeText.admins(user));
    }

    function test_nominateOwnerSetsPendingOwner() public {
        vm.prank(owner);
        vm.expectEmit(true, true, false, true);
        emit OwnerChanged(owner, user);
        vibeText.nominateOwner(user);

        assertEq(vibeText.pendingOwner(), user);
    }

    function test_acceptOwnershipTransfersOwnership() public {
        vm.prank(owner);
        vibeText.nominateOwner(user);

        vm.prank(user);
        vm.expectEmit(true, false, false, true);
        emit OwnerAccepted(user);
        vibeText.acceptOwnership();

        assertEq(vibeText.owner(), user);
        assertEq(vibeText.pendingOwner(), address(0));
        assertTrue(vibeText.admins(user));
    }

    function test_revert_nominateOwnerNotOwner() public {
        vm.prank(user);
        vm.expectRevert(IVibeText.NotOwner.selector);
        vibeText.nominateOwner(user);
    }

    function test_revert_nominateOwnerZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(IVibeText.AddressZero.selector);
        vibeText.nominateOwner(address(0));
    }

    function test_revert_acceptOwnershipNotPendingOwner() public {
        vm.prank(user);
        vm.expectRevert(IVibeText.NotPendingOwner.selector);
        vibeText.acceptOwnership();
    }

    function test_addAndRemoveAdmin() public {
        vm.prank(owner);
        vibeText.addAdmin(user);
        assertTrue(vibeText.admins(user));

        vm.prank(owner);
        vibeText.removeAdmin(user);
        assertFalse(vibeText.admins(user));
    }

    function test_rewardValidatorPaysOutAndMarksProcessed() public {
        vm.deal(address(vibeText), 1 ether);

        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit ValidatorRewarded(user, 0.5 ether, "verification-1");
        vibeText.rewardValidator(user, 0.5 ether, "verification-1");

        assertEq(user.balance, 10 ether + 0.5 ether);
        assertTrue(vibeText.processedVerifications("verification-1"));
    }

    function test_withdrawSendsFundsToOwner() public {
        vm.deal(address(vibeText), 2 ether);

        uint256 ownerInitialBalance = owner.balance;
        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit Withdrawn(owner, 1 ether);
        vibeText.withdraw(1 ether);

        assertEq(address(vibeText).balance, 1 ether);
        assertEq(owner.balance, ownerInitialBalance + 1 ether);
    }

    function test_revert_withdrawInsufficientFunds() public {
        vm.deal(address(vibeText), 1 ether);

        vm.prank(owner);
        vm.expectRevert(IVibeText.TreasuryDepleted.selector);
        vibeText.withdraw(2 ether);
    }

    function test_pauseAndUnpauseFlow() public {
        vm.prank(owner);
        vibeText.pause();
        assertTrue(vibeText.paused());

        vm.prank(owner);
        vibeText.unpause();
        assertFalse(vibeText.paused());
    }
}
