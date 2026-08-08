import { ethers } from "ethers";

let provider = null;
let signer = null;

const rpcUrl = process.env.BOTCHAIN_RPC_URL;
// Strip out angle brackets `< >` in case the user pasted them literally in the .env
const rawKey = process.env.ORACLE_PRIVATE_KEY || "";
const privateKey = rawKey.replace(/[<>]/g, '').trim();

if (rpcUrl && privateKey) {
    try {
        provider = new ethers.JsonRpcProvider(rpcUrl);
        signer = new ethers.Wallet(privateKey, provider);
    } catch (err) {
        console.error("[Blockchain] Failed to initialize Wallet (Check Private Key format):", err.message);
    }
} else {
    console.warn("[Blockchain] Missing BOTCHAIN_RPC_URL or ORACLE_PRIVATE_KEY. Oracle signer disabled.");
}

export { provider, signer };
