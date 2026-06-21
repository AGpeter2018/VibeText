import { useState } from 'react';
import { Sparkles, Languages, Settings2, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface TuneFormProps {
  onSubmit: (text: string, vibe: string, intensity: number) => void;
  isLoading: boolean;
}

const VIBE_CATEGORIES = {
  "Cultural & Regional": ["Nigerian Gen Z", "Lagos Street", "London Roadman", "Southern US", "Jamaican Patois", "Tokyo Casual", "Mumbai Street"],
  "Professional": ["Corporate Executive", "Diplomatic", "Startup Founder", "Customer Support"],
  "Entertainment & Character": ["1920s Mafia", "Movie Trailer Narrator", "Shakespeare", "Anime Protagonist"],
  "Social": ["Gen Z", "Millennial", "Sarcastic", "Friendly", "Aggressive"]
};

export function TuneForm({ onSubmit, isLoading }: TuneFormProps) {
  const [text, setText] = useState('');
  const [vibe, setVibe] = useState(VIBE_CATEGORIES["Social"][0]);
  const [intensity, setIntensity] = useState(5);

  const MAX_CHARS = 500;
  const isOverLimit = text.length > MAX_CHARS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isOverLimit) return;
    onSubmit(text, vibe, intensity);
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit} 
      className="glassmorphism rounded-3xl p-6 sm:p-8 w-full max-w-2xl mx-auto flex flex-col gap-6 relative"
    >
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex flex-col gap-3 relative">
        <div className="flex items-center justify-between">
          <label htmlFor="text" className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
            Original Text
          </label>
          <span className={`text-xs font-medium transition-colors ${isOverLimit ? 'text-red-400' : 'text-slate-500'}`}>
            {text.length} / {MAX_CHARS}
          </span>
        </div>
        
        <div className="relative">
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Drop your boring text here..."
            className={`input-glass rounded-2xl p-4 w-full min-h-[140px] resize-y text-slate-100 placeholder:text-slate-600 font-sans transition-all pr-12 ${text.length === 0 ? 'shadow-[0_0_15px_rgba(255,255,255,0.05)]' : ''} ${isOverLimit ? '!border-red-500/50 focus:!ring-red-500/50' : ''}`}
            disabled={isLoading}
          />
          {text.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={() => setText('')}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Vibe */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Languages size={16} className="text-primary-400" />
            Target Vibe
          </label>
          <select 
            value={vibe} 
            onChange={(e) => setVibe(e.target.value)}
            disabled={isLoading}
            className="input-glass w-full rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-primary-500/50 bg-transparent"
          >
            {Object.entries(VIBE_CATEGORIES).map(([category, vibes]) => (
              <optgroup key={category} label={category} className="bg-slate-900 text-slate-400">
                {vibes.map(v => (
                  <option key={v} value={v} className="text-slate-200 bg-slate-800">{v}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Intensity */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Settings2 size={16} className="text-accent-400" />
                Intensity
            </div>
            <span className="text-accent-400 font-bold">{intensity}</span>
          </label>
          <input 
            type="range" 
            min="1" max="10" 
            value={intensity} 
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            disabled={isLoading}
            className="w-full accent-accent-500 mt-2"
          />
        </div>
      </div>

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
            <span className="relative z-10">{isOverLimit ? 'Text too long' : 'Vibe It!'}</span>
          </>
        )}
      </button>
    </motion.form>
  );
}
