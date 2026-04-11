// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {VibeText} from "../src/VibeText.sol";
import {IVibeText} from "../src/Interface/IVibeText.sol";

contract VibeTextTest is Test {
    VibeText public vibeText;

    address public owner = address(0x123);
    address public user = address(0x456);

    // Events
    event TuneRequested(address indexed requester, string input, string country);
    event Withdrawn(address indexed owner, uint256 amount);
    event PriceChanged(uint256 newPrice);
    event Paused(address account);
    event Unpaused(address account);

    function setUp() public {
        vm.deal(user, 10 ether);
        vm.deal(owner, 10 ether);
        vibeText = new VibeText(owner);
    }

    function test_owner() public {
        assertEq(owner, vibeText.owner());
        assert(vibeText.owner() != user);
    }

    // --- Modifier Tests ---
    function test_onlyOwnerThrowsForUser() public {
        vm.prank(user);
        vm.expectRevert(IVibeText.NotOwner.selector);
        vibeText.pause();
    }

    function test_onlyOwnerPassesForOwner() public {
        vm.prank(owner);
        vibeText.pause();
        assertEq(vibeText.paused(), true);
    }

    // --- requestTune Tests ---

    function test_requestTuneHappyPath() public {
        vm.prank(user);
        vm.expectEmit(true, false, false, true);
        emit TuneRequested(user, "hello", "FR");
        vibeText.requestTune("hello", "FR");
    }

    function test_requestTuneWithPrice() public {
        vm.prank(owner);
        vibeText.changePrice(0.01 ether);

        vm.prank(user);
        vm.expectEmit(true, false, false, true);
        emit TuneRequested(user, "hello", "FR");
        vibeText.requestTune{value: 0.01 ether}("hello", "FR");
    }

    function testRevert_requestTuneInsufficientPayment() public {
        vm.prank(owner);
        vibeText.changePrice(0.01 ether);

        vm.prank(user);
        vm.expectRevert(IVibeText.InsufficientPayment.selector);
        vibeText.requestTune{value: 0.005 ether}("hello", "FR");
    }

    function testRevert_requestTuneWhenPaused() public {
        vm.prank(owner);
        vibeText.pause();

        vm.prank(user);
        vm.expectRevert("Pausable: paused");
        vibeText.requestTune("hello", "FR");
    }

    // --- changePrice Tests ---

    function test_changePriceHappyPath() public {
        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit PriceChanged(1 ether);
        vibeText.changePrice(1 ether);

        assertEq(vibeText.PRICE(), 1 ether);
    }

    function testRevert_changePriceNotOwner() public {
        vm.prank(user);
        vm.expectRevert(IVibeText.NotOwner.selector);
        vibeText.changePrice(1 ether);
    }

    // --- withdraw Tests ---

    function test_withdrawHappyPath() public {
        vm.prank(owner);
        vibeText.changePrice(1 ether);
        
        vm.prank(user);
        vibeText.requestTune{value: 2 ether}("hello", "US");

        assertEq(address(vibeText).balance, 2 ether);
        uint256 ownerInitialBalance = owner.balance;

        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit Withdrawn(owner, 1.5 ether);
        vibeText.withdraw(1.5 ether);

        assertEq(address(vibeText).balance, 0.5 ether);
        assertEq(owner.balance, ownerInitialBalance + 1.5 ether);
    }

    function testRevert_withdrawInsufficientFunds() public {
        vm.prank(owner);
        vibeText.changePrice(1 ether);
        
        vm.prank(user);
        vibeText.requestTune{value: 1 ether}("hello", "US");

        vm.prank(owner);
        vm.expectRevert(IVibeText.InsufficientFunds.selector);
        vibeText.withdraw(2 ether);
    }

    function testRevert_withdrawNotOwner() public {
        vm.prank(user);
        vm.expectRevert(IVibeText.NotOwner.selector);
        vibeText.withdraw(1 ether);
    }

    function testRevert_withdrawFailed() public {
        RejectingReceiver rejector = new RejectingReceiver();
        VibeText vibeWithRejectingOwner = new VibeText(address(rejector));
        
        vm.deal(address(vibeWithRejectingOwner), 2 ether);

        vm.prank(address(rejector));
        vm.expectRevert(IVibeText.WithdrawFailed.selector);
        vibeWithRejectingOwner.withdraw(1 ether);
    }

    // --- PauseModule Tests ---

    function test_pauseEmitsEvent() public {
        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit Paused(owner);
        vibeText.pause();
    }

    function testRevert_pauseAlreadyPaused() public {
        vm.prank(owner);
        vibeText.pause();

        vm.prank(owner);
        vm.expectRevert("Pausable: paused");
        vibeText.pause();
    }

    function test_unpauseEmitsEvent() public {
        vm.prank(owner);
        vibeText.pause();

        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit Unpaused(owner);
        vibeText.unpause();

        assertEq(vibeText.paused(), false);
    }

    function testRevert_unpauseNotPaused() public {
        vm.prank(owner);
        vm.expectRevert("Pausable: not paused");
        vibeText.unpause();
    }
}

contract RejectingReceiver {
    // Rejects incoming ETH by default since there's no receive or fallback
}
