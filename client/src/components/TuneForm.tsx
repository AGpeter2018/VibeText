import { useState, useEffect, useRef } from 'react';
import { Sparkles, Languages, Settings2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


interface TuneFormProps {
  onSubmit: (text: string, country: string, dialect: string, intensity?: string) => void;
  isLoading: boolean;
}

const DIALECTS = [
  'Gen-Z Slang',
  'British Roadman',
  'Corporate Professional',
  'Southern US',
  'Shakespearean',
  'Aussie Bogan',
  'Cyberpunk Hacker'
];

export function TuneForm({ onSubmit, isLoading }: TuneFormProps) {
  const [text, setText] = useState('');
  const [country, setCountry] = useState('United States');
  const [dialect, setDialect] = useState(DIALECTS[0]);
  const [intensity, setIntensity] = useState('Medium');
  
  const [countries, setCountries] = useState<string[]>(['United States', 'United Kingdom', 'Australia', 'Canada']);

  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isDialectOpen, setIsDialectOpen] = useState(false);
  const [isIntensityOpen, setIsIntensityOpen] = useState(false);

  const countryRef = useRef<HTMLDivElement>(null);
  const dialectRef = useRef<HTMLDivElement>(null);
  const intensityRef = useRef<HTMLDivElement>(null);

  const MAX_CHARS = 500;
  const isOverLimit = text.length > MAX_CHARS;

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name')
      .then(res => res.json())
      .then(data => {
        const countryNames = data.map((c) => c.name.common).sort();
        setCountries(countryNames);
      })
      .catch(err => console.error("Failed to load countries:", err));
  }, []);

  // Click-Outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setIsCountryOpen(false);
      }
      if (dialectRef.current && !dialectRef.current.contains(event.target as Node)) {
        setIsDialectOpen(false);
      }
      if (intensityRef.current && !intensityRef.current.contains(event.target as Node)) {
        setIsIntensityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isOverLimit) return;
    onSubmit(text, country, dialect, intensity);
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit} 
      className="glassmorphism rounded-3xl p-6 sm:p-8 w-full flex flex-col gap-6 relative"
    >
      {/* Decorative background glow */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Input Section */}
      <div className="flex flex-col gap-3 relative">
        <div className="flex items-center justify-between">
          <label htmlFor="text" className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
            Original Text
          </label>
          <span className={`text-xs font-medium transition-colors \${isOverLimit ? 'text-red-400' : 'text-slate-500'}`}>
            {text.length} / {MAX_CHARS}
          </span>
        </div>
        
        <div className="relative">
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Drop your boring text here..."
            className={`input-glass rounded-2xl p-4 w-full min-h-[140px] resize-y text-slate-100 placeholder:text-slate-600 font-sans transition-all pr-12 \${text.length === 0 ? 'shadow-[0_0_15px_rgba(255,255,255,0.05)]' : ''} \${isOverLimit ? '!border-red-500/50 focus:!ring-red-500/50' : ''}`}
            disabled={isLoading}
          />
          {text.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={() => setText('')}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
              title="Clear text"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Country */}
        <div className="flex flex-col gap-3" ref={countryRef}>
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe text-primary-400 w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            Target Country
          </label>
          <div className="relative">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setIsCountryOpen(!isCountryOpen)}
              className="input-glass w-full rounded-xl p-3 flex justify-between items-center text-slate-200 text-left cursor-pointer"
            >
              <span className="truncate">{country}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform duration-200 min-w-3 \${isCountryOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
            </button>
            
            <AnimatePresence>
              {isCountryOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 top-full mt-2 w-full glassmorphism rounded-xl max-h-60 overflow-y-auto py-1 shadow-2xl border border-white/10 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
                >
                  {countries.map(c => (
                    <div
                      key={c}
                      onClick={() => { setCountry(c); setIsCountryOpen(false); }}
                      className={`px-4 py-2.5 cursor-pointer hover:bg-white/10 transition-colors text-sm \${country === c ? 'text-primary-400 bg-white/5 font-medium' : 'text-slate-300'}`}
                    >
                      {c}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dialect */}
        <div className="flex flex-col gap-3" ref={dialectRef}>
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Languages size={16} className="text-primary-400" />
            Target Vibe
          </label>
          <div className="relative">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setIsDialectOpen(!isDialectOpen)}
              className="input-glass w-full rounded-xl p-3 flex justify-between items-center text-slate-200 text-left cursor-pointer"
            >
              <span className="truncate">{dialect}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform duration-200 min-w-3 \${isDialectOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
            </button>
            
            <AnimatePresence>
              {isDialectOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 top-full mt-2 w-full glassmorphism rounded-xl max-h-60 overflow-y-auto py-1 shadow-2xl border border-white/10 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
                >
                  {DIALECTS.map(d => (
                    <div
                      key={d}
                      onClick={() => { setDialect(d); setIsDialectOpen(false); }}
                      className={`px-4 py-2.5 cursor-pointer hover:bg-white/10 transition-colors text-sm \${dialect === d ? 'text-primary-400 bg-white/5 font-medium' : 'text-slate-300'}`}
                    >
                      {d}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Intensity */}
        <div className="flex flex-col gap-3" ref={intensityRef}>
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Settings2 size={16} className="text-accent-400" />
            Vibe Intensity
          </label>
          <div className="relative">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setIsIntensityOpen(!isIntensityOpen)}
              className="input-glass w-full rounded-xl p-3 flex justify-between items-center text-slate-200 text-left cursor-pointer"
            >
              <span>{intensity}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform duration-200 min-w-3 \${isIntensityOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
            </button>

            <AnimatePresence>
              {isIntensityOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 top-full mt-2 w-full glassmorphism rounded-xl overflow-hidden py-1 shadow-2xl border border-white/10"
                >
                  {['Subtle', 'Medium', 'Maximum'].map(i => (
                    <div
                      key={i}
                      onClick={() => { setIntensity(i); setIsIntensityOpen(false); }}
                      className={`px-4 py-2.5 cursor-pointer hover:bg-white/10 transition-colors text-sm \${intensity === i ? 'text-accent-400 bg-white/5 font-medium' : 'text-slate-300'}`}
                    >
                      {i}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !text.trim() || isOverLimit}
        className="mt-2 group relative w-full flex justify-center items-center gap-2 py-4 px-8 border border-transparent text-base font-semibold rounded-2xl text-white bg-white/5 hover:bg-white/10 active:bg-white/5 border-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
      >
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-600/50 via-accent-500/50 to-primary-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
            <span className="relative z-10">Tuning the vibe...</span>
          </div>
        ) : (
          <>
            <Sparkles size={18} className="relative z-10 group-hover:text-accent-400 transition-colors" />
            <span className="relative z-10">{isOverLimit ? 'Text too long' : 'Vibe It (0.01 ETH)'}</span>
          </>
        )}
      </button>
    </motion.form>
  );
}
