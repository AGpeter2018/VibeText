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
        address newOwner = vm.envOr("NEW_OWNER", address(0));

        console.log("Deploying VibeText from:", deployerAddress);

        vm.startBroadcast(deployerPrivateKey);
        vibeText = new VibeText(deployerAddress);
        console.log("VibeText deployed at:", address(vibeText));
        vm.stopBroadcast();

        if (newOwner != address(0)) {
            console.log("Nomination pending for new owner:", newOwner);

            vm.startBroadcast(deployerPrivateKey);
            vibeText.nominateOwner(newOwner);
            vm.stopBroadcast();

            console.log("Owner nominated. To complete transfer, the new owner must call acceptOwnership().");
        }
    }
}
