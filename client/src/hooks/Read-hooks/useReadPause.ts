import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { vibeTextContract } from "../../constant/contract"

const useReadPause = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [isPause, setIsPause] = useState<boolean>(false);

    const readBalance = useCallback(async () => {    
        setLoading(true);
        try {
            const contract = await vibeTextContract()
            const pauseState = await contract.paused()
            console.log("this is pause state:",pauseState)
            if(pauseState === true) {
                setIsPause(true)
                console.log("this is pause state pursed:",pauseState)
            } else{
                setIsPause(false)
                console.log("this is pause state unpursed:",pauseState)
            }
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

    return { isPause, loading };
};

export default useReadPause;
