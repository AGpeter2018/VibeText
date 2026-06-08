import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { vibeTextContract } from "../../constant/contract";
import { formatUnits } from "ethers";

const useReadPrice = () => {
    const [price, setPrice] = useState<string>("0");
    const [loading, setLoading] = useState<boolean>(false);

    const fetchPrice = useCallback(async () => {    
        setLoading(true);
        try {
            const contract = vibeTextContract();
            const priceVal = await contract.PRICE();
            const formattedPrice = formatUnits(priceVal, 18)
            const cleanDisplay = Number(formattedPrice).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 4
            });
            setPrice(cleanDisplay);
            console.log("this is price:",cleanDisplay)
        } catch (error) {
            console.error("Error reading price:", error);
            toast.error("Failed to read price from contract");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrice();
    }, [fetchPrice]);

    return { price, loading, fetchPrice };
};

export default useReadPrice;
