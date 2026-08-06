import { ethers} from "ethers";

export const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_BOT_CHAIN_RPC_URL);