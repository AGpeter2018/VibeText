import { Contract } from 'ethers'
import { Abi } from './abi'
import { provider } from './provider'

export const vibeTextContract = () => {
    const address = import.meta.env.VITE_VIBETEXT_CONTRACT_ADDRESS 

    if (!address) {
       throw new Error("Contract address is undefined. Check your environment variables.");
    }

    return new Contract(address, Abi, provider)
}