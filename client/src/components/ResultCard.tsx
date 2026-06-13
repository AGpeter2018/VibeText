import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Sparkle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ResultCardProps {
  result: string | null;
  isLoading?: boolean;
}

export function ResultCard({ result, isLoading }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  // Typewriter effect
  useEffect(() => {
    if (!result) {
      setDisplayedText('');
      return;
    }

    setDisplayedText('');
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + result.charAt(i));
      i++;
      if (i >= result.length) {
        clearInterval(intervalId);
      }
    }, 15); // Speed of typing in ms

    return () => clearInterval(intervalId);
  }, [result]);

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
        className="w-full relative group h-full"
      >
          {/* Animated Glow Border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000" />
          
          <div className="relative glassmorphism rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
            
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-primary-400 font-medium">
                <Sparkle size={18} />
                <h3>Your Vibe</h3>
               </div>
               
               <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white text-sm font-medium transition-all"
               >
                 {copied ? (
                   <>
                     <Check size={14} className="text-green-400" />
                     <span className="text-green-400">Copied</span>
                   </>
                 ) : (
                   <>
                     <Copy size={14} />
                     <span>Copy</span>
                   </>
                 )}
               </button>
            </div>

            <div className="bg-slate-950/50 rounded-2xl p-5 border border-white/5 min-h-[250px] relative flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                  <div className="w-8 h-8 border-4 border-slate-800 border-t-primary-500 rounded-full animate-spin"></div>
                  <p className="text-sm animate-pulse">Tuning your vibe...</p>
                </div>
              ) : result ? (
                <p className="text-slate-100 leading-relaxed font-sans whitespace-pre-wrap">
                  {displayedText}
                  {displayedText !== result && (
                    <span className="inline-block w-2.5 h-4 ml-1 bg-primary-400 animate-pulse align-middle opacity-80" />
                  )}
                </p>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50">
                  <Sparkle size={32} className="text-slate-700" />
                  <p className="text-sm text-center px-4">Your tuned text will appear here.<br/>Drop some text and select a vibe to begin.</p>
                </div>
              )}
            </div>

          </div>
        </motion.div>
    </AnimatePresence>
  );
}
