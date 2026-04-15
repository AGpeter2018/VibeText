import { Wallet, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  onLaunch?: () => void;
  isAppView?: boolean;
}

export function Navbar({ onLaunch, isAppView = false }: NavbarProps) {
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const handleConnect = () => {
    if (connectionState === 'connected') {
      setConnectionState('disconnected');
    } else {
      setConnectionState('connecting');
      setTimeout(() => setConnectionState('connected'), 1500);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 glassmorphism border-b-white/5 border-b-[1px]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between pointer-events-auto">
        
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">
                V
              </span>
            </div>
          </div>
          {(!isAppView) && (
            <span className="text-xl tracking-tight font-semibold text-white">
              VibeText
            </span>
          )}
        </div>

        <div className="flex items-center gap-6">
          {/* Launch App Button for Landing Page */}
          {onLaunch && !isAppView && (
             <button 
                onClick={onLaunch}
                className="hidden sm:block text-slate-300 hover:text-white font-medium transition-colors"
             >
                Launch App
             </button>
          )}

          {/* Connect Button (Mock) */}
          <button
            onClick={handleConnect}
            disabled={connectionState === 'connecting'}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 min-w-[170px] cursor-pointer \${
              connectionState === 'connected'
                ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                : 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-80 disabled:cursor-wait'
            }`}
          >
            {connectionState === 'connecting' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet size={18} className={connectionState === 'connected' ? 'text-primary-500' : ''} />
                {connectionState === 'connected' ? '0xA1...b29' : 'Connect Wallet'}
              </>
            )}
          </button>
        </div>

      </div>
    </nav>
  );
}
