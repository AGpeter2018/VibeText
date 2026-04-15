import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Sparkle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ResultCardProps {
  result: string | null;
}

export function ResultCard({ result }: ResultCardProps) {
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
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
          className="w-full max-w-2xl mx-auto mt-8 relative group"
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

            <div className="bg-slate-950/50 rounded-2xl p-5 border border-white/5 min-h-[100px] relative">
              <p className="text-slate-100 leading-relaxed font-sans whitespace-pre-wrap">
                {displayedText}
                {displayedText !== result && (
                  <span className="inline-block w-2.5 h-4 ml-1 bg-primary-400 animate-pulse align-middle opacity-80" />
                )}
              </p>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
