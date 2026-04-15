import { Activity, Settings, Banknote, ShieldAlert, Sparkles, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export function AdminPanel() {
  const [isPaused, setIsPaused] = useState(false);
  const [price, setPrice] = useState('0.01');
  const [balance] = useState('4.25');

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
          <div className="text-4xl font-bold text-white">{balance} ETH</div>
          <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10">
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
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold \${!isPaused ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {!isPaused ? 'Active & Live' : 'Paused'}
            </span>
          </div>
          <button onClick={() => setIsPaused(!isPaused)} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10">
            {isPaused ? 'Unpause Contract' : 'Pause Contract'}
          </button>
        </div>

        {/* Pricing Module */}
        <div className="glassmorphism p-6 rounded-3xl border-white/5 flex flex-col gap-6 md:col-span-2">
          <div className="flex items-center gap-3 text-lg font-medium text-slate-200">
            <div className="p-2 rounded-xl bg-white/5"><Settings size={20} className="text-primary-400" /></div>
            Pricing Engine
          </div>
          
          <div className="flex gap-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">ETH</span>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-glass w-full rounded-xl p-3 pl-14 text-slate-100" 
              />
            </div>
            <button className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-colors">
              Update Price
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
