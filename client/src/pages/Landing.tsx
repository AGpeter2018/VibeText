import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, MessageSquare, TrendingUp, Users, 
  Zap, Share2, Globe2, ArrowRight, Shield, Smile
} from 'lucide-react';

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="flex flex-col items-center w-full">
      
      {/* 1. HERO SECTION */}
      <section className="w-full max-w-6xl mx-auto text-center px-4 pt-16 pb-24 relative">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 font-medium text-sm mb-8 backdrop-blur-sm">
            <Sparkles size={16} />
            <span>VibeText Protocol v1.0 is Live</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-extrabold text-white mb-8 tracking-tighter leading-tight">
            Rewrite the Web.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-400 to-orange-400">
              Find Your Vibe.
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            The first community-driven AI text engine. Transform boring corporate jargon into Gen Z slang, rewrite angry emails into professional masterpieces, and share your creations on the Vibe Wall.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/tune" 
              className="w-full sm:w-auto px-10 py-5 rounded-full font-bold transition-all duration-300 bg-white text-slate-900 hover:scale-105 shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] text-lg flex items-center justify-center gap-3"
            >
              Enter The Studio <ArrowRight size={20} />
            </Link>
            <Link 
              to="/feed" 
              className="w-full sm:w-auto px-10 py-5 rounded-full font-bold transition-all duration-300 bg-slate-900/50 backdrop-blur-md text-white hover:bg-slate-800 border border-slate-700 text-lg flex items-center justify-center gap-3"
            >
              Explore The Wall <Globe2 size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section className="w-full bg-slate-900/30 border-y border-white/5 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-web3 opacity-30 mix-blend-screen pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How VibeText Works</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Three simple steps to transform your communication and join the culture.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glassmorphism p-8 rounded-3xl relative">
              <div className="text-6xl font-black text-white/5 absolute top-4 right-6">1</div>
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Input Raw Text</h3>
              <p className="text-slate-400 leading-relaxed">Drop in your standard, boring, or raw text. It can be an email, a tweet, or a paragraph you don't know how to phrase.</p>
            </div>

            <div className="glassmorphism p-8 rounded-3xl relative">
              <div className="text-6xl font-black text-white/5 absolute top-4 right-6">2</div>
              <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center text-primary-400 mb-6">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dial the Engine</h3>
              <p className="text-slate-400 leading-relaxed">Select from dozens of cultural vibes (Gen Z, Shakespeare, Corporate) and slide the intensity from subtle to unhinged.</p>
            </div>

            <div className="glassmorphism p-8 rounded-3xl relative">
              <div className="text-6xl font-black text-white/5 absolute top-4 right-6">3</div>
              <div className="w-14 h-14 bg-accent-500/20 rounded-2xl flex items-center justify-center text-accent-400 mb-6">
                <Share2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Publish & Share</h3>
              <p className="text-slate-400 leading-relaxed">Publish your masterpiece to the global Vibe Wall. Get upvoted, climb the trending charts, and share as an image.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. USE CASES SECTION */}
      <section className="w-full max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Unleash Your Creativity</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">VibeText isn't just for fun; it's a powerful tool for modern communication.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Example 1 */}
          <div className="glassmorphism rounded-3xl overflow-hidden flex flex-col">
            <div className="bg-slate-900/80 p-6 border-b border-white/5 flex items-center justify-between">
              <span className="text-slate-400 font-medium text-sm flex items-center gap-2"><Shield size={16}/> Professional</span>
              <ArrowRight className="text-slate-600" />
              <span className="text-accent-400 font-medium text-sm flex items-center gap-2"><Smile size={16}/> Gen Z (Lvl 8)</span>
            </div>
            <div className="p-8 flex flex-col gap-6">
              <div className="bg-slate-800/50 p-4 rounded-xl border-l-4 border-slate-600">
                <p className="text-slate-400 italic">"I will not be able to attend the meeting today as I am feeling unwell. Please proceed without me."</p>
              </div>
              <div className="bg-primary-900/20 p-4 rounded-xl border-l-4 border-primary-500">
                <p className="text-white font-medium text-lg">"besties i'm down bad with a sickness rn 💀 ain't no way i'm making that zoom call. y'all hold it down without me fr fr 🙏"</p>
              </div>
            </div>
          </div>

          {/* Example 2 */}
          <div className="glassmorphism rounded-3xl overflow-hidden flex flex-col">
            <div className="bg-slate-900/80 p-6 border-b border-white/5 flex items-center justify-between">
              <span className="text-slate-400 font-medium text-sm flex items-center gap-2"><Smile size={16}/> Angry</span>
              <ArrowRight className="text-slate-600" />
              <span className="text-blue-400 font-medium text-sm flex items-center gap-2"><Shield size={16}/> Corporate Passive-Aggressive</span>
            </div>
            <div className="p-8 flex flex-col gap-6">
              <div className="bg-slate-800/50 p-4 rounded-xl border-l-4 border-slate-600">
                <p className="text-slate-400 italic">"Why did nobody tell me about the deadline change? This is ridiculous and I refuse to do it this fast."</p>
              </div>
              <div className="bg-blue-900/20 p-4 rounded-xl border-l-4 border-blue-500">
                <p className="text-white font-medium text-lg">"Per my previous understanding of the timeline, this recent adjustment was not communicated. I suggest we circle back on expectations moving forward."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMMUNITY STATS SECTION */}
      <section className="w-full bg-gradient-to-b from-transparent to-primary-950/30 py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 mb-4">
                <Users size={32} />
              </div>
              <h3 className="text-5xl font-black text-white mb-2">10k+</h3>
              <p className="text-slate-400 font-medium text-lg">Active Creators</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-accent-500/20 rounded-full flex items-center justify-center text-accent-400 mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-5xl font-black text-white mb-2">50k+</h3>
              <p className="text-slate-400 font-medium text-lg">Vibes Published</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 mb-4">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-5xl font-black text-white mb-2">1M+</h3>
              <p className="text-slate-400 font-medium text-lg">Total Upvotes</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA SECTION */}
      <section className="w-full max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="glassmorphism p-12 rounded-[3rem] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/30 via-accent-500/30 to-orange-500/30" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to change the conversation?</h2>
            <p className="text-xl text-slate-300 mb-10">No credit card required. Jump in anonymously or sign up to save your vibes.</p>
            <Link 
              to="/tune" 
              className="inline-block px-12 py-5 rounded-full font-bold transition-all duration-300 bg-white text-slate-900 hover:scale-105 shadow-xl text-xl"
            >
              Start Tuning Now
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
