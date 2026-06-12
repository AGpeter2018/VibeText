import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from "@reown/appkit/react";
import { vibeTextContract } from "../../constant/contract";
import toast from "react-hot-toast";
import { supportedChain } from "../../lib/supportedChain";
import { useCallback } from "react";
import { ethers } from "ethers";


const useWriteUnPause = () => {
    const { chainId } = useAppKitNetwork()
    const { isConnected } = useAppKitAccount()
    const { walletProvider} = useAppKitProvider("eip155")

    
    const writeUnPause = useCallback( async () : Promise<boolean> => {
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
        const contract = vibeTextContract().connect(signer) as ethers.Contract 

        let loadingToastId: string | undefined;
        try {
            loadingToastId = toast.loading('Setting a unpause...');
            const tx = await contract.unpause()
            const receipt = await tx.wait()           
            toast.dismiss(loadingToastId)
            if (receipt && receipt.status === 1) {
                toast.success('Contract unpaused successfully')
                return 
            } else {
                toast.error('Contract unpause failed')
                return
            }
            
        } catch (error) {
            if (loadingToastId) toast.dismiss(loadingToastId);
            const err = error as { reason?: string; message?: string };
            if (err.message && err.message.includes("execution reverted: You are not the owner")) {
                toast.error("You are not the owner of the contract")
            } else {
                toast.error(err.reason || err.message || "Failed to set a contract unpause")
            }
        }

    }, [chainId, isConnected, walletProvider])

    return { writeUnPause }
}

export default useWriteUnPause