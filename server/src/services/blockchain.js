import { ethers } from 'ethers';

// Minimal ABI — we only need the functions we call from the backend oracle
const VIBETEXT_ABI = [
    "function rewardValidator(address _validator, uint256 _amount, string memory _verificationId) public",
    "function admins(address) public view returns (bool)",
    "event ValidatorRewarded(address indexed validator, uint256 rewardAmount, string verificationId)"
];

// Gas-free reward amount per validated rating (0.01 BOT tokens = 10 * 10^15 wei)
// Can be tuned later without redeploying the contract
const DEFAULT_REWARD_WEI = ethers.parseEther("0.01");

let provider = null;
let signer = null;
let contract = null;
let initialized = false;

/**
 * Lazily initialize the provider, signer, and contract instance.
 * We do it once on first call so the server doesn't crash at startup if env vars are missing.
 */
function getContract() {
    if (initialized) return contract;

    const rpcUrl = process.env.BOTCHAIN_RPC_URL;
    const privateKey = process.env.ORACLE_PRIVATE_KEY;
    const contractAddress = process.env.VIBETEXT_CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
        console.warn('[Blockchain] BOTCHAIN_RPC_URL, ORACLE_PRIVATE_KEY, or VIBETEXT_CONTRACT_ADDRESS missing. On-chain rewards disabled.');
        initialized = true;
        return null;
    }

    try {
        provider = new ethers.JsonRpcProvider(rpcUrl);
        signer = new ethers.Wallet(privateKey, provider);
        contract = new ethers.Contract(contractAddress, VIBETEXT_ABI, signer);
        initialized = true;
        console.log('[Blockchain] Oracle service ready. Contract:', contractAddress);
    } catch (err) {
        console.error('[Blockchain] Failed to initialize oracle service:', err.message);
        initialized = true; // Mark as initialized so we don't retry on every request
    }

    return contract;
}

/**
 * Reward a validator for submitting a high-quality authenticity rating.
 * Called by the backend after a user submits a 5-star rating WITH a community note.
 * 
 * @param {string} walletAddress  - The on-chain address of the user (from User model)
 * @param {string} verificationId - Unique MongoDB ObjectId of the rating record (prevents replay)
 * @param {bigint} [rewardWei]    - Optional custom reward amount in wei
 * @returns {Promise<string|null>} Transaction hash if successful, null if skipped
 */
export async function rewardValidator(walletAddress, verificationId, rewardWei = DEFAULT_REWARD_WEI) {
    const vibeContract = getContract();

    // If contract is not configured, silently skip (graceful degradation)
    if (!vibeContract) return null;

    // Basic sanity check — don't send to zero address
    if (!walletAddress || walletAddress === ethers.ZeroAddress) {
        console.warn('[Blockchain] Skipping reward — user has no linked wallet.');
        return null;
    }

    try {
        console.log(`[Blockchain] Rewarding validator ${walletAddress} | ID: ${verificationId} | Amount: ${ethers.formatEther(rewardWei)} BOT`);

        const tx = await vibeContract.rewardValidator(walletAddress, rewardWei, verificationId);
        const receipt = await tx.wait(); // Wait for 1 confirmation

        console.log(`[Blockchain] ✅ Reward confirmed! TxHash: ${receipt.hash}`);
        return receipt.hash;
    } catch (err) {
        // Don't throw — a blockchain error should never fail the user's HTTP request
        console.error(`[Blockchain] ❌ Failed to reward validator: ${err.message}`);
        return null;
    }
}
