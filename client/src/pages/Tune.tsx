import { useState } from 'react';
import { Sparkles, Settings2, SlidersHorizontal, Type } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { ResultCard } from '../components/ResultCard';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Tune() {
  const [searchParams] = useSearchParams();
  const [originalText, setOriginalText] = useState('');
  const [vibe, setVibe] = useState(searchParams.get('vibe') || 'Gen Z');
  const [intensity, setIntensity] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [tunedText, setTunedText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const VIBES = [
    'Gen Z', 'Corporate', 'Shakespearean', 'Pirate', 'Cyberpunk',
    'passive-aggressive', 'Overly Enthusiastic', 'Surfer', 'Goth'
  ];

  const handleSubmit = async () => {
    if (!originalText) return;
    setIsLoading(true);
    try {
      const res = await api.post('tune', { text: originalText, dialect: vibe, intensity });
      setTunedText(res.data.content);
      setImageUrl(res.data.imageUrl);
    } catch (err) {
      console.error(err);
      toast.error('Failed to tune text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
      <div className="text-center mb-10 w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight flex justify-center items-center gap-3">
          <Sparkles className="text-primary-400" size={36} /> The Studio
        </h1>
        <p className="text-lg text-slate-400">Craft your message. Dial in the perfect vibe.</p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* Input & Controls */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="glassmorphism p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-4 text-white font-semibold">
              <Type size={18} className="text-primary-400" /> Original Text
            </div>
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Paste the boring text you want to transform..."
              className="w-full h-40 input-glass rounded-2xl p-4 text-white resize-none"
              maxLength={500}
            />
            <div className="text-right text-xs text-slate-500 mt-2 font-medium">
              {originalText.length} / 500
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-6 text-white font-semibold">
              <Settings2 size={18} className="text-accent-400" /> Engine Settings
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Target Vibe</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {VIBES.slice(0, 6).map((v) => (
                    <button
                      key={v}
                      onClick={() => setVibe(v)}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${vibe === v
                        ? 'bg-primary-600/20 border-primary-500 text-white shadow-inner'
                        : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20'
                        }`}
                    >
                      {v}
                    </button>
                  ))}
                  <select
                    className="col-span-2 sm:col-span-3 bg-slate-900/50 border border-white/5 text-slate-300 rounded-xl py-2 px-3 outline-none focus:border-primary-500"
                    value={VIBES.includes(vibe) ? (VIBES.indexOf(vibe) < 6 ? '' : vibe) : vibe}
                    onChange={(e) => setVibe(e.target.value)}
                  >
                    <option value="" disabled>More Vibes...</option>
                    {VIBES.slice(6).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <SlidersHorizontal size={16} /> Intensity
                  </label>
                  <span className="text-primary-400 font-bold bg-primary-900/30 px-2 py-0.5 rounded-md">Lvl {intensity}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #ec4899 ${(intensity / 10) * 100}%, #1e293b ${(intensity / 10) * 100}%, #1e293b 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                  <span>Subtle</span>
                  <span>Unhinged</span>
                </div>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!originalText || isLoading}
            className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold py-5 px-6 rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 transition-all flex items-center justify-center gap-2 text-lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Vibe...
              </div>
            ) : (
              <>
                <Sparkles size={24} /> Vibe It!
              </>
            )}
          </motion.button>
        </div>

        {/* Output Area */}
        <div className="md:col-span-5 flex flex-col gap-4">
          {!tunedText ? (
            <div className="h-full min-h-[300px] glassmorphism rounded-3xl border-dashed border-2 border-slate-700/50 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-600 mb-4">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">Awaiting Input</h3>
              <p className="text-slate-500 text-sm">Your tuned text will magically appear here.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-full"
            >
              <ResultCard
                originalText={originalText}
                result={tunedText}
                vibe={vibe}
                intensity={intensity}
                imageUrl={imageUrl}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
