import { ethers } from "ethers";
import { VIBETEXT_ABI } from "./Abi.js";
import { signer } from "./Provider.js";

const VIBETEXT_CONTRACT_ADDRESS = process.env.VIBETEXT_CONTRACT_ADDRESS;

let vibeContract = null;

if (!signer || !VIBETEXT_CONTRACT_ADDRESS) {
    console.warn("[Blockchain] Missing signer or VIBETEXT_CONTRACT_ADDRESS. Oracle disabled.");
} else {
    try {
        vibeContract = new ethers.Contract(VIBETEXT_CONTRACT_ADDRESS, VIBETEXT_ABI, signer);
    } catch (error) {
        console.error('[Blockchain] ❌ Failed to initialize oracle:', error.message);
    }
}

export default vibeContract;