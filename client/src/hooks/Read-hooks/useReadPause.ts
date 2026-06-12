import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { vibeTextContract } from "../../constant/contract"

const useReadPause = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [isPause, setIsPause] = useState<boolean>(false);

    const refetchPause = useCallback(async () => {    
        setLoading(true);
        try {
            const contract = vibeTextContract();
            const pauseState = await contract.paused();
            setIsPause(Boolean(pauseState));
        } catch (error) {
            console.error("Error reading pause state:", error);
            toast.error("Failed to read contract pause state");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetchPause();
    }, [refetchPause]);

    return { isPause, loading, refetchPause };
};

export default useReadPause;
