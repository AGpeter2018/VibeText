import { useAppKitAccount } from '@reown/appkit/react';

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkle, ArrowRight } from 'lucide-react';


export function Hero() {
  const navigate = useNavigate();
  const { isConnected } = useAppKitAccount();
  const handleLaunch = () => {
    if (!isConnected) {
      return;
    } else {
      navigate('/app');
    }  
  };

  return (
    <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[85vh]">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-3xl mx-auto flex flex-col items-center gap-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-primary-300 backdrop-blur-sm">
          <Sparkle size={16} className="text-accent-400" />
          The Web3 AI Linguistic Transformer
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-tight">
          Tune your text to absolutely <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 animate-gradient-x">
            any Vibe.
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl px-4">
          Instantly translate standard English into over 190 regional dialects or cultural slang styles using advanced AI, fully secured by the blockchain.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
          <button 
            onClick={handleLaunch}
            className="group relative flex justify-center items-center gap-2 py-4 px-10 text-lg font-semibold rounded-2xl text-white bg-primary-600 hover:bg-primary-500 shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] transition-all duration-300"
          >
            Launch app
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* Decorative floating elements */}
      <div className="absolute top-[20%] left-[10%] w-32 h-32 bg-primary-600/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-48 h-48 bg-accent-500/20 rounded-full blur-[100px] pointer-events-none" />
    </section>
  );
}
