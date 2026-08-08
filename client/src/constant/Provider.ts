import { ethers } from 'ethers';

export const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_LISK_SEPOLIA_RPC_URL);