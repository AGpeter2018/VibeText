// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console2 as console} from "forge-std/console2.sol";
import {VibeText} from "../src/VibeText.sol";

contract DeployVibeText is Script {
    VibeText public vibeText;
    function setUp() public {}

    function run() public {
        // uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        // address deployerAddress = vm.addr(deployerPrivateKey);
        
        // Let's set up the user's private key as well
        // uint256 userPrivateKey = vm.envUint("USER_PRIVATE_KEY");
        // address userAddress = vm.addr(userPrivateKey);

        // console.log("Deploying VibeText from:", deployerAddress);

        // --- DEPLOYER ACTIONS ---
        vm.startBroadcast();

        vibeText = new VibeText(msg.sender);
        // console.log("VibeText deployed at:", address(vibeText));

        // vibeText.changePrice(0.01 ether);
        // console.log("Price initialized to:", vibeText.PRICE());

       

        vm.stopBroadcast(); 
        // -----------------------


        // --- USER ACTIONS ---
        // console.log("User calling requestTune from:", userAddress);
        
        // Start a NEW broadcast as the user
        // vm.startBroadcast(userPrivateKey);

        // The user makes the requestTune call
        // vm.deal(userAddress, 10 ether); 
        // vibeText.requestTune{value: 0.5 ether}("hello world", "US");
        // console.log("User balance after requestTune:", address(userAddress).balance);
        // console.log("deployer balance after requestTune:", address(deployerAddress).balance);
        // console.log("contract balance after requestTune:", address(vibeText).balance); 

        // vm.stopBroadcast();

        // Deployer Interaction: Withdraw funds
        // console.log("Deployer withdrawing funds...");
        // vm.startBroadcast(deployerPrivateKey);
        // vibeText.withdraw(0.2 ether); 
        // console.log("Deployer balance after withdrawal:", address(deployerAddress).balance);
        // console.log("Contract balance after withdrawal:", address(vibeText).balance);

        // Deployer Interaction: Pause the contract
        // console.log("Deployer pausing the contract...");
        // vibeText.pause();
        // console.log("Contract paused:", vibeText.paused());

        //  vm.stopBroadcast();

        // Start a NEW broadcast as the user
        // vm.startBroadcast(userPrivateKey);

        // The user makes the requestTune call
        // vm.deal(userAddress, 10 ether); // Ensure user has enough balance for the test
        // vibeText.requestTune{value: 0.2 ether}("hello world", "US");
        // console.log("User balance after requestTune:", address(userAddress).balance);
        // console.log("deployer balance after requestTune:", address(deployerAddress).balance);
        // console.log("contract balance after requestTune:", address(vibeText).balance); 

        // vm.stopBroadcast();

        // --------------------
        
        // console.log("Deployment and test interaction complete!");
    }
}
