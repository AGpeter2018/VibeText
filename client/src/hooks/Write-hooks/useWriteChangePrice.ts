import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from "@reown/appkit/react";
import { vibeTextContract } from "../../constant/contract";
import toast from "react-hot-toast";
import { supportedChain } from "../../lib/supportedChain";
import { useCallback } from "react";
import { ethers } from "ethers";


const useChangePrice = () => {
    const { chainId } = useAppKitNetwork()
    const { isConnected } = useAppKitAccount()
    const { walletProvider} = useAppKitProvider("eip155")

    
    const writeChangePrice = useCallback( async (newPrice: string) : Promise<void> => {
        if (!isConnected) {
            toast.error('Please connect wallet')
            return
        }
        
        if (chainId !== supportedChain) {
            toast.error('switch to lisk sepolia chain')
            return
        }
        
        if (!walletProvider) {
            toast.error('No Wallet detected')
            return
        }

        const ethersProvider = new ethers.BrowserProvider(walletProvider as ethers.Eip1193Provider)
        const signer = await ethersProvider.getSigner()
        const contract = vibeTextContract().connect(signer) as ethers.BaseContract & {
            changePrice: (price: bigint) => Promise<ethers.ContractTransactionResponse>;
        }

        try {
            const loading = toast.loading('setting a new price')
            const formatPrice = ethers.parseUnits(newPrice, 18)
            const tx = await contract.changePrice(formatPrice)
            console.log('this is contract tx:', tx)
            const receipt = await tx.wait()
            console.log('this is contract recipt:', receipt)
            const txStatus = receipt.status
            toast.dismiss(loading)
            if(txStatus === 1) {
                toast.success('price changed successfully')
                return 
            } else {
                toast.error('price changed failed')
                return
            }
            
        } catch (error) {
            toast.dismiss(); // Dismiss any pending loading toasts
            const err = error as { reason?: string; message?: string };
            if (err.message && err.message.includes("execution reverted: You are not the owner")) {
                toast.error("You are not the owner of the contract")
            } else {
                toast.error(err.reason || err.message || "Failed to set a new price")
            }
        }

    }, [chainId, isConnected, walletProvider])

    return { writeChangePrice }
}

export default useChangePrice