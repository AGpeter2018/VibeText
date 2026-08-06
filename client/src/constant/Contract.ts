import { Contract } from "ethers";
import { provider } from "./Provider";
import { VibeText_Abi } from "./Abi";

export const VibeTextContract = new Contract(
  import.meta.env.VITE_VIBETEXT_CONTRACT_ADDRESS,
  VibeText_Abi,
  provider
);