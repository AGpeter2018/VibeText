import { Contract } from 'ethers'
import { Abi } from './abi'
import { signer } from './provider'

export const vibeTextContract = new Contract(import.meta.env.VIBETEXT_CONTRACT_ADDRESS, Abi, signer)