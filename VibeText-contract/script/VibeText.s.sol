// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console2 as console} from "forge-std/console2.sol";
import {VibeText} from "../src/VibeText.sol";

contract DeployVibeText is Script {
    function setUp() public {}

    function run() public {
        uint256 ownerPrivateKey = vm.envUint("PRIVATE_KEY");
        address ownerAddress = vm.addr(ownerPrivateKey);

        // Simulating the Node.js backend acting as an admin
        uint256 backendPrivateKey = vm.envUint("USER_PRIVATE_KEY");
        address backendAddress = vm.addr(backendPrivateKey);

        // A random user validating text on the frontend
        address validatorAddress = address(0xABCD);

        // If running locally (Anvil uses Chain ID 31337), magically fund the wallets with 10 ETH so it doesn't crash on OutOfFunds!
        if (block.chainid == 31337) {
            vm.deal(ownerAddress, 10 ether);
            vm.deal(backendAddress, 10 ether);
        }

        console.log("=== VibeText BOT Chain Demo ===");
        console.log("Protocol Owner:", ownerAddress);
        console.log("Backend Oracle:", backendAddress);

        // --- 1. PROTOCOL DEPLOYMENT & SETUP (OWNER) ---
        vm.startBroadcast(ownerPrivateKey);

        VibeText vibeText = new VibeText(ownerAddress);
        console.log("1. Contract Deployed at:", address(vibeText));

        // Add the backend address as an authorized Admin Oracle so it can process payouts
        vibeText.addAdmin(backendAddress);
        console.log("2. Registered Node.js Backend as Admin Oracle");

        // Fund the protocol treasury with 1 native token
        vibeText.fundTreasury{value: 1 ether}();
        console.log("3. Funded VibeText Treasury with 1 BOT Token");

        vm.stopBroadcast();

        console.log("Current Treasury Balance:", address(vibeText).balance);

        // --- 2. AUTHENTICITY VALIDATION (NODE.JS BACKEND) ---
        vm.startBroadcast(backendPrivateKey);

        console.log("-> A user on the frontend just rated a Vibe 5-stars!");
        console.log(
            "-> Node.js verified the MongoDB data and is securely signing the payout on-chain..."
        );

        // The backend triggers the micro-reward payload to the validator mapping to the MongoDB object ID
        vibeText.rewardValidator(
            validatorAddress,
            0.05 ether,
            "mongo_doc_id_99x3"
        );

        vm.stopBroadcast();

        console.log(
            "4. SUCCESS: Validator Rewarded 0.05 BOT at",
            validatorAddress
        );
        console.log("Final Treasury Balance:", address(vibeText).balance);
        console.log("=== Demo Simulation Complete! ===");
    }
}
