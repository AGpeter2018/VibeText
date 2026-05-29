import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { vibeTextContract } from "../../constant/contract";

const useReadPrice = () => {
    const [price, setPrice] = useState<string>("0");
    const [loading, setLoading] = useState<boolean>(false);

    const fetchPrice = useCallback(async () => {    
        setLoading(true);
        try {
            const contract = vibeTextContract();
            const priceVal = await contract.PRICE();
            setPrice(ethers.formatEther(priceVal));
        } catch (error) {
            console.error("Error reading price:", error);
            toast.error("Failed to read price from contract");
        } finally {
            setLoading(false);
        }
    }, [price]);

    useEffect(() => {
        fetchPrice();
    }, [fetchPrice]);

    return { price, loading, fetchPrice };
};

export default useReadPrice;
