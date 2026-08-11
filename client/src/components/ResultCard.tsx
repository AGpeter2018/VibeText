import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Sparkle, Share2, UploadCloud } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ResultCardProps {
  result: string | null;
  originalText: string;
  vibe: string;
  intensity: number;
  imageUrl?: string | null;
}

export function ResultCard({ result, originalText, vibe, intensity, imageUrl }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTypingDone, setIsTypingDone] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Typewriter effect
  useEffect(() => {
    if (!result) {
      setDisplayedText('');
      setIsTypingDone(false);
      return;
    }

    setDisplayedText('');
    setIsTypingDone(false);
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + result.charAt(i));
      i++;
      if (i >= result.length) {
        setIsTypingDone(true);
        clearInterval(intervalId);
      }
    }, 15);

    return () => clearInterval(intervalId);
  }, [result]);

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleShareImage = async () => {
    if (!cardRef.current) return;
    setIsGeneratingImage(true);
    try {
      const dataUrl = await toPng(cardRef.current, { backgroundColor: '#020617', cacheBust: true });
      const cleanVibe = vibe.replace(/\s+/g, '-');

      const blob = await fetch(dataUrl).then(res => res.blob());
      const file = new File([blob], `VibeText-${cleanVibe}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `VibeText — #${vibe} Vibe`,
          text: `Check out my text tuned in the '${vibe}' style on VibeText!`,
        });
      } else {
        // Fallback: download dynamically
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `VibeText-${cleanVibe}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      console.error("Failed to share/generate image", err);
      toast.error('Failed to share or generate image: ' + (err.message || err));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handlePublish = async () => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }

    setIsPublishing(true);
    try {
      await api.post('feed/publish', {
        originalText,
        tunedText: result,
        vibe,
        intensity,
        imageUrl
      });
      navigate('/feed');
    } catch (err: any) {
      console.error('Failed to publish', err);
      toast.error('Failed to publish: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
            className="w-full max-w-2xl mx-auto mt-8 relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000" />

            <div className="relative glassmorphism rounded-3xl p-6 sm:p-8 flex flex-col gap-4">

              <div ref={cardRef} className="bg-slate-950 p-6 rounded-2xl border border-white/5 flex flex-col">

                {imageUrl && (
                  <div className="w-full h-48 sm:h-64 mb-6 rounded-xl overflow-hidden border border-white/10 relative shrink-0">
                    <img
                      src={imageUrl.startsWith('http') && !imageUrl.includes('image-proxy')
                        ? `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
                        : imageUrl}
                      alt="Vibe AI Art"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 text-primary-400 font-medium mb-4">
                  <Sparkle size={18} />
                  <h3>{vibe} (Intensity: {intensity})</h3>
                </div>

                <div className="bg-white/5 rounded-xl p-4 text-slate-400 text-sm italic mb-4">
                  "{originalText}"
                </div>

                <p className="text-slate-100 leading-relaxed font-sans whitespace-pre-wrap text-lg">
                  {displayedText}
                  {!isTypingDone && (
                    <span className="inline-block w-2.5 h-4 ml-1 bg-primary-400 animate-pulse align-middle opacity-80" />
                  )}
                </p>

                <div className="mt-6 text-center text-slate-600 text-xs font-semibold tracking-wider uppercase">
                  Made with VibeText.com
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-4 mt-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white text-sm font-medium transition-all"
                  >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    {copied ? <span className="text-green-400">Copied</span> : <span>Copy</span>}
                  </button>

                  <button
                    onClick={handleShareImage}
                    disabled={isGeneratingImage || !isTypingDone}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingImage ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Share2 size={16} />}
                    {isGeneratingImage ? 'Generating...' : 'Share Image'}
                  </button>
                </div>

                <button
                  onClick={handlePublish}
                  disabled={isPublishing || !isTypingDone}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UploadCloud size={18} />}
                  Publish to Vibe Wall
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
