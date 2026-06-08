import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { provider } from "../../constant/provider"
import { formatUnits } from "ethers";

const useReadBalance = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [balance, setBalance] = useState<string>("0");

    const readBalance = useCallback(async () => {    
        setLoading(true);
        try {
            const address = import.meta.env.VITE_VIBETEXT_CONTRACT_ADDRESS
            const getBalance = await provider.getBalance(address)
            const formattedBalance = formatUnits(getBalance, 18)
            const cleanDisplay = Number(formattedBalance).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 4
            });
            setBalance(cleanDisplay)
            console.log("This is balance",cleanDisplay)
        } catch (error) {
            console.error("Error reading price:", error);
            toast.error("Failed to read price from contract");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        readBalance();
    }, [readBalance]);

    return { balance, loading };
};

export default useReadBalance;
