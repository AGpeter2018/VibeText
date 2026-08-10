import { ethers } from 'ethers';

// --- ABI for the current VibeText contract surface used by the backend oracle ---
const VIBETEXT_ABI = [
    "function acceptOwnership() public",
    "function addAdmin(address _admin) public",
    "function admins(address) public view returns (bool)",
    "function fundTreasury() public payable",
    "function nominateOwner(address _newOwner) public",
    "function owner() public view returns (address)",
    "function pause() public",
    "function pendingOwner() public view returns (address)",
    "function processedVerifications(string) public view returns (bool)",
    "function removeAdmin(address _admin) public",
    "function rewardValidator(address _validator, uint256 _amount, string memory _verificationId) public",
    "function unpause() public",
    "function withdraw(uint256 _amount) public",
    "event AdminAdded(address indexed admin)",
    "event AdminRemoved(address indexed admin)",
    "event OwnerAccepted(address indexed newOwner)",
    "event OwnerChanged(address indexed previousOwner, address indexed newOwner)",
    "event Paused(address account)",
    "event TreasuryFunded(address indexed funder, uint256 amount)",
    "event Unpaused(address account)",
    "event ValidatorRewarded(address indexed validator, uint256 rewardAmount, string verificationId)",
    "event Withdrawn(address indexed owner, uint256 amount)"
];

// --- Lazy initialization: only set up provider/signer/contract on first call ---
let _contract = null;
let _provider = null;

export function getContract() {
    if (_contract) return _contract;

    const rpcUrl = process.env.BOTCHAIN_RPC_URL;
    const rawKey = process.env.ORACLE_PRIVATE_KEY || '';
    // Strip < > brackets in case user pasted them literally
    const privateKey = rawKey.replace(/[<>]/g, '').trim();
    const contractAddress = process.env.VIBETEXT_CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
        console.warn('[Blockchain] Missing env vars (BOTCHAIN_RPC_URL / ORACLE_PRIVATE_KEY / VIBETEXT_CONTRACT_ADDRESS). Oracle disabled.');
        return null;
    }

    try {
        _provider = new ethers.JsonRpcProvider(rpcUrl);
        const signer = new ethers.Wallet(privateKey, _provider);
        _contract = new ethers.Contract(contractAddress, VIBETEXT_ABI, signer);
        console.log(`[Blockchain] ✅ Oracle initialized. Signer: ${signer.address}`);
    } catch (err) {
        console.error('[Blockchain] ❌ Failed to initialize oracle:', err.message);
    }

    return _contract;
}

export function getProvider() {
    // Ensure contract (and provider) are initialized
    getContract();
    return _provider;
}

/**
 * Reward a validator for submitting a high-quality authenticity rating.
 * @param {string} walletAddress  - The on-chain address of the user being rewarded
 * @param {string} verificationId - Unique ID to prevent replay attacks
 * @param {bigint} [rewardWei]    - Optional custom reward amount in wei
 * @returns {Promise<string|null>} Transaction hash if successful, null if skipped
 */
export async function rewardValidator(walletAddress, verificationId, rewardWei = ethers.parseEther("0.001")) {
    const contract = getContract();
    if (!contract) return null;

    if (!walletAddress || walletAddress === ethers.ZeroAddress) {
        console.warn('[Blockchain] Skipping reward — user has no linked wallet.');
        return null;
    }

    try {
        console.log(`[Blockchain] 🚀 Sending reward to ${walletAddress} | ID: ${verificationId}`);
        const tx = await contract.rewardValidator(walletAddress, rewardWei, verificationId);
        const receipt = await tx.wait();
        console.log(`[Blockchain] ✅ Reward confirmed! TxHash: ${receipt.hash}`);
        return receipt.hash;
    } catch (err) {
        console.error(`[Blockchain] ❌ Failed to reward validator: ${err.message}`);
        return null;
    }
}
