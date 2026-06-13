import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from "@reown/appkit/react";
import { vibeTextContract } from "../../constant/contract";
import toast from "react-hot-toast";
import { supportedChain } from "../../lib/supportedChain";
import { useCallback } from "react";
import { ethers } from "ethers";


const UsewriteRequestTune = () => {
    const { chainId } = useAppKitNetwork()
    const { isConnected } = useAppKitAccount()
    const { walletProvider} = useAppKitProvider("eip155")

    
    const writeRequestTune = useCallback( async (_input: string, _country: string) : Promise<string> => {
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
            loadingToastId = toast.loading('requesting a tune...');
            const tx = await contract.requestTune.staticCall(_input, _country)
            const receipt = await tx.wait()           
            toast.dismiss(loadingToastId)
            if (receipt && receipt.status === 1) {
                toast.success('Tune requested successfully')
                return 
            } else {
                toast.error('Tune requested failed')
                return
            }
            
        } catch (error) {
            if (loadingToastId) toast.dismiss(loadingToastId);
            const err = error as { reason?: string; message?: string };
            if (err.message ) {
                toast.error("Error in requesting a tune")
            } else {
                toast.error(err.reason || err.message || "Failed to request a tune")
            }
        }

    }, [chainId, isConnected, walletProvider])

    return { writeRequestTune }
}

export default UsewriteRequestTune