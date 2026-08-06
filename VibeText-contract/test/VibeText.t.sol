// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {VibeText} from "../src/VibeText.sol";
import {IVibeText} from "../src/Interface/IVibeText.sol";

contract VibeTextTest is Test {
    VibeText public vibeText;

    address public owner = address(0x123);
    address public admin = address(0x456);
    address public validator = address(0x789);

    // Events matching interface
    event TreasuryFunded(address indexed funder, uint256 amount);
    event ValidatorRewarded(
        address indexed validator,
        uint256 rewardAmount,
        string verificationId
    );
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event Withdrawn(address indexed owner, uint256 amount);
    event Paused(address account);
    event Unpaused(address account);

    function setUp() public {
        vm.deal(owner, 10 ether);
        vm.deal(admin, 10 ether);
        vm.deal(validator, 0 ether);
        vibeText = new VibeText(owner);
    }

    function test_owner() public {
        assertEq(owner, vibeText.owner());
    }

    // --- Admin Management Tests ---
    function test_addAdmin() public {
        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit AdminAdded(admin);
        vibeText.addAdmin(admin);

        assertTrue(vibeText.admins(admin));
    }

    function testRevert_addAdminNotOwner() public {
        vm.prank(admin);
        vm.expectRevert(IVibeText.NotOwner.selector);
        vibeText.addAdmin(admin);
    }

    function test_removeAdmin() public {
        vm.prank(owner);
        vibeText.addAdmin(admin);

        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit AdminRemoved(admin);
        vibeText.removeAdmin(admin);

        assertFalse(vibeText.admins(admin));
    }

    // --- Treasury Funding Tests ---
    function test_fundTreasury() public {
        vm.prank(admin);
        vm.expectEmit(true, false, false, true);
        emit TreasuryFunded(admin, 1 ether);
        vibeText.fundTreasury{value: 1 ether}();

        assertEq(address(vibeText).balance, 1 ether);
    }

    function test_fallbackFunding() public {
        vm.prank(admin);
        (bool success, ) = address(vibeText).call{value: 1 ether}("");
        assertTrue(success);
        assertEq(address(vibeText).balance, 1 ether);
    }

    function testRevert_fundTreasuryZero() public {
        vm.prank(admin);
        vm.expectRevert(IVibeText.InvalidAmount.selector);
        vibeText.fundTreasury();
    }

    // --- Reward Validator Tests ---
    function test_rewardValidator() public {
        // Setup Protocol
        vm.prank(owner);
        vibeText.addAdmin(admin);
        vm.prank(owner);
        vibeText.fundTreasury{value: 2 ether}();

        // Admin rewards validator
        vm.prank(admin);
        vm.expectEmit(true, false, false, true);
        emit ValidatorRewarded(validator, 0.5 ether, "mongo_doc_id_1");
        vibeText.rewardValidator(validator, 0.5 ether, "mongo_doc_id_1");

        assertEq(validator.balance, 0.5 ether);
        assertTrue(vibeText.processedVerifications("mongo_doc_id_1"));
    }

    function testRevert_rewardValidatorNotAdmin() public {
        vm.prank(owner);
        vibeText.fundTreasury{value: 2 ether}();

        vm.prank(validator);
        vm.expectRevert(IVibeText.NotAdmin.selector);
        vibeText.rewardValidator(validator, 0.5 ether, "mongo_doc_id_2");
    }

    function testRevert_rewardValidatorAlreadyProcessed() public {
        vm.prank(owner);
        vibeText.addAdmin(admin);
        vm.prank(owner);
        vibeText.fundTreasury{value: 2 ether}();

        vm.prank(admin);
        vibeText.rewardValidator(validator, 0.5 ether, "mongo_doc_1");

        vm.prank(admin);
        vm.expectRevert(IVibeText.AlreadyProcessed.selector);
        vibeText.rewardValidator(validator, 0.5 ether, "mongo_doc_1");
    }

    function testRevert_rewardValidatorDepleted() public {
        vm.prank(owner);
        vibeText.addAdmin(admin);
        vm.prank(owner);
        vibeText.fundTreasury{value: 0.1 ether}();

        vm.prank(admin);
        vm.expectRevert(IVibeText.TreasuryDepleted.selector);
        vibeText.rewardValidator(validator, 0.5 ether, "doc_3");
    }

    function testRevert_rewardValidatorAddressZero() public {
        vm.prank(owner);
        vibeText.addAdmin(admin);

        vm.prank(admin);
        vm.expectRevert(IVibeText.AddressZero.selector);
        vibeText.rewardValidator(address(0), 0.5 ether, "mongo_doc_4");
    }

    // --- Pause Tests ---
    function test_pauseEmitsEvent() public {
        vm.prank(owner);
        emit Paused(owner);
        vibeText.pause();
    }

    function test_unpauseEmitsEvent() public {
        vm.prank(owner);
        vibeText.pause();

        vm.prank(owner);
        emit Unpaused(owner);
        vibeText.unpause();
    }
}
