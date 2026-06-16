import toast from "react-hot-toast";
import { useState } from "react";

const useApiTune = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    
    // Note: The order here MUST match what TuneForm sends: text, country, dialect, intensity
    const handleTuneText = async (text: string, country: string, dialect: string, intensity?: string) => {
      setIsLoading(true);
      setResult(null);
    
        try {
               const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tune`, {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({ text, dialect,  country, intensity})
            })

               if (!response.ok) throw new Error('Server error');
               const data = await response.json()
               // The server returns lowercase 'content'
               setResult(data.content);
       } catch (error) {
        const err = error as Error;
        toast.error(err.message || 'Failed to tune text');
       } finally {
        setIsLoading(false);
       }
    };
    return {isLoading, result, handleTuneText}
}

export default useApiTune;