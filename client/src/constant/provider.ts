import { ethers } from 'ethers';

export const provider = new ethers.BrowserProvider(import.meta.env.VITE_LISK_SEPOLIA_RPC_URL)
export const signer = await provider.getSigner()