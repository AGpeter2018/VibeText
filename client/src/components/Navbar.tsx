import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { Wallet, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


// interface NavbarProps {
//   onLaunch?: () => void;
//   isAppView?: boolean;
// }

export function Navbar() {
  const navigate = useNavigate()
  const [isWaiting, setIswaiting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const { open } = useAppKit()
  const { address, isConnected, status } = useAppKitAccount()
  const { disconnect } = useDisconnect()

  const handleLaunch = () => {
    navigate('/app');
  }

  const handleConnect = () => {
    if (isConnected) {
      setIsDisconnecting(true)
      setTimeout(async () => {
        await disconnect()
        setIsDisconnecting(false)
      }, 1500);

    } else {
      setIswaiting(true)
      setTimeout(() => {
        open()
        setIswaiting(false)
      }, 1500)
    }
  };


  const showSpinner = isWaiting || status === 'connecting' || status === 'reconnecting';

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

          <span className="text-xl tracking-tight font-semibold text-white">
            VibeText
          </span>

        </div>

        <div className="flex items-center gap-6">
          {/* Launch App Button for Landing Page */}

          <button
            onClick={handleLaunch}
            className="hidden sm:block text-slate-300 hover:text-white font-medium transition-colors"
          >
            Launch App
          </button>

          {/* Connect Button (Mock) */}
          <button
            onClick={handleConnect}
            disabled={showSpinner}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 min-w-[170px] cursor-pointer ${isConnected
              ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              : 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-80 disabled:cursor-wait'
              }`}
          >
            {showSpinner ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Connecting...
              </>
            ) : isDisconnecting ? (

              <>
                <Loader2 size={18} className="animate-spin" />
                Disconnecting...
              </>
            ) : isConnected ? (
              <>
                <Wallet size={18} className='text-primary-500' />
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
              </>
            ) : (
              <>
                <Wallet size={18} className='text-primary-500' />
                Connect Wallet
              </>
            )}
          </button>
        </div>

      </div>
    </nav>
  );
}


