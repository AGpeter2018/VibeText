// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console2 as console} from "forge-std/console2.sol";
import {VibeText} from "../src/VibeText.sol";

contract DeployVibeText is Script {
    VibeText public vibeText;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);

        console.log("Deploying VibeText from:", deployerAddress);

        vm.startBroadcast(deployerPrivateKey);
        vibeText = new VibeText(deployerAddress);
        console.log("VibeText deployed at:", address(vibeText));
        vm.stopBroadcast();
    }
}
