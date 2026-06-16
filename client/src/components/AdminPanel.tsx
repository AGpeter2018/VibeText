import { Activity, Settings, Banknote, ShieldAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import useReadPrice from '../hooks/Read-hooks/useReadPrice';
import useReadBalance from '../hooks/Read-hooks/useReadBalance';
import useReadPause from '../hooks/Read-hooks/useReadPause';
import useChangePrice from '../hooks/Write-hooks/useWriteChangePrice';
import useWritePause from '../hooks/Write-hooks/useWritePause';
import useWriteUnPause from '../hooks/Write-hooks/useWriteUnpause';

import toast from 'react-hot-toast';
import { useAppKitAccount } from '@reown/appkit/react';

export function AdminPanel() {
  const { isConnected } = useAppKitAccount();
  
  const { price, loading: priceLoading } = useReadPrice();
  const { balance } = useReadBalance()
  const { isPause, refetchPause } = useReadPause()
  const { writeChangePrice } = useChangePrice()
  const { writePause } = useWritePause()
  const { writeUnPause } = useWriteUnPause()
  
  
  const [inputPrice, setInputPrice] = useState<string>("0");
  const [paused, setPaused] = useState<boolean>(false);
  // const { unPaused, setUnPaused } = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false);
  const [isPauseTogging, setIsPauseToggling] = useState<boolean>(false);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (price && price !== "0") {
      setInputPrice(price);
    } else {
      setInputPrice("0")
    }
  }, [price]);

  useEffect(() => {
    if (isPause !== undefined) {
      setPaused(isPause);
      // Only toast on subsequent changes (not on initial mount)
      if (hasMounted.current) {
        toast(isPause ? '⏸ Contract paused' : '▶ Contract is live', {
          icon: isPause ? '⏸' : '✅',
        });
      } else {
        hasMounted.current = true;
      }
    }
    
  }, [isPause]);

  const handleUpdatedPrice = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isConnected) {
      toast.error('Connect your wallet first');
      return;
    }

    if (!inputPrice || inputPrice === "0") {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setLoading(true);
      await writeChangePrice(inputPrice)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseToggle = async () => {
    if (!isConnected) {
      toast.error('Connect your wallet first');
      return;
    }
    setIsPauseToggling(true);
    try {
      if (paused) {
        await writeUnPause();
      } else {
        await writePause();
      }
      // Re-read chain state so UI reflects actual contract state
      await refetchPause();
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to toggle contract state');
    } finally {
      setIsPauseToggling(false);
    }
  };

  const handleWithdraw = () => {
    if (!isConnected) {
      toast.error('Connect your wallet first');
      return;
    }
    toast('Withdraw coming soon', { icon: '🚧' });
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-8 p-6">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <ShieldAlert className="text-accent-400" />
          Protocol Admin
        </h2>
        <p className="text-slate-400 mt-2">Manage the VibeText smart contract configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Treasury Card */}
        <div className="glassmorphism p-6 rounded-3xl border-white/5 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-lg font-medium text-slate-200">
            <div className="p-2 rounded-xl bg-white/5"><Banknote size={20} className="text-green-400" /></div>
            Treasury Balance
          </div>
          {loading || priceLoading ? (
             <div className='flex justify-center items-center py-4 flex-1'>
                <div className='animate-spin rounded-full h-8 w-8 border-4 border-slate-700 border-t-indigo-500'></div>
                <span className='ml-3 text-slate-400 font-medium'>Processing...</span>
              </div>
          ) : (
            <div className="text-4xl font-bold text-white">{balance} ETH</div>
          )}
          <button onClick={handleWithdraw} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10">
            Withdraw Funds
          </button>
        </div>

        {/* Status Card */}
        <div className="glassmorphism p-6 rounded-3xl border-white/5 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-lg font-medium text-slate-200">
            <div className="p-2 rounded-xl bg-white/5"><Activity size={20} className="text-blue-400" /></div>
            Contract Status
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${!paused ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {!paused ? 'Active & Live' : 'Paused'}
            </span>
          </div>
          <button
            onClick={handlePauseToggle}
            disabled={isPauseTogging}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPauseTogging ? 'Processing...' : paused ? 'Unpause Contract' : 'Pause Contract'}
          </button>
        </div>

        {/* Pricing Module */}
        <div className="glassmorphism p-6 rounded-3xl border-white/5 flex flex-col gap-6 md:col-span-2">
          <div className="flex items-center gap-3 text-lg font-medium text-slate-200">
            <div className="p-2 rounded-xl bg-white/5"><Settings size={20} className="text-primary-400" /></div>
            Pricing Engine
          </div>
          
          <div className="flex gap-4">
            {priceLoading || loading ? (
              <div className='flex justify-center items-center py-4 flex-1'>
                <div className='animate-spin rounded-full h-8 w-8 border-4 border-slate-700 border-t-indigo-500'></div>
                <span className='ml-3 text-slate-400 font-medium'>Processing...</span>
              </div>
            ) : (
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">ETH</span>
                <input 
                  type="text" 
                  value={inputPrice}
                  onChange={(e) => setInputPrice(e.target.value)}
                  className="input-glass w-full rounded-xl p-3 pl-14 text-slate-100" 
                />
              </div>
            )}
            
            <button 
              className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={handleUpdatedPrice}
              disabled={loading || priceLoading}
            >
              Update Price
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
