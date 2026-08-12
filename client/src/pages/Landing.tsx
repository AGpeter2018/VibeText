import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wand2, MessageSquare, TrendingUp, Users,
  Zap, Share2, Globe2, ArrowRight, Shield, Star, Lock, Gift
} from 'lucide-react';
import { useState } from 'react';

export default function Landing() {
  const [activeBeforeAfter, setActiveBeforeAfter] = useState(0);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.18, delayChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55 } }
  };

  const beforeAfterExamples = [
    {
      title: "Corporate to Gen Z",
      raw: "I will not be able to attend the meeting today as I am feeling unwell. Please proceed without me and send the notes afterwards.",
      tuned: "besties i'm down bad with a sickness rn 💀 ain't no way i'm making that zoom call. y'all hold it down without me and drop the notes in the chat fr fr 🙏",
      vibe: "Gen Z",
      level: "Max (Lvl 10)"
    },
    {
      title: "Angry to Professional",
      raw: "Why did nobody tell me about the deadline change? This is ridiculous and I absolutely refuse to do it this fast without help.",
      tuned: "Per my previous understanding of the timeline, this recent adjustment was not communicated to our team. I suggest we circle back on expectations moving forward, as we will require additional resources to meet this new target.",
      vibe: "Passive-Aggressive Corporate",
      level: "Subtle (Lvl 4)"
    },
    {
      title: "Boring to Victorian",
      raw: "Can you review my code PR? It's ready, let me know if there are bugs.",
      tuned: "Hark! Might I entreat thee to cast thine eyes upon my recent parchment of code? 'Tis prepared for thine inspection. Pray, inform me shouldst thou discover any foul defects therein.",
      vibe: "Shakespearean",
      level: "Dramatic (Lvl 8)"
    }
  ];

  return (
    <div className="flex flex-col items-center w-full">

      {/* 1. HERO SECTION */}
      <section className="w-full relative bg-slate-950 overflow-hidden">
        {/* Background Image Setup */}
        <div
          className="absolute inset-0 z-0 opacity-[0.35] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        {/* Dark overlay gradient to blend edges */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950" />

        <div className="w-full max-w-7xl mx-auto text-center px-4 pt-32 pb-40 relative z-20">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col items-center"
          >
            <motion.div variants={item} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/60 border border-primary-500/30 text-primary-200 font-bold text-xs md:text-sm mb-10 backdrop-blur-xl shadow-2xl">
              <Wand2 size={16} className="text-primary-400" />
              <span>VibeText Protocol v2.5 is Live: Marketplace & Authenticity Engine</span>
            </motion.div>

            <motion.h1 variants={item} className="text-6xl md:text-[5.5rem] font-black text-white mb-8 tracking-tighter leading-[1.05] drop-shadow-2xl">
              Rewrite the web.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-300 to-purple-400">
                Find your voice.
              </span>
            </motion.h1>

            <motion.p variants={item} className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-14 leading-relaxed font-light drop-shadow-md">
              The world's first community-driven AI text engine. Transform boring corporate jargon into Gen Z slang, rewrite angry emails into professional masterpieces, and share your creations instantly.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/tune"
                className="w-full sm:w-auto px-10 py-5 rounded-full font-bold transition-all duration-300 bg-white text-slate-950 hover:scale-105 shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:shadow-[0_0_60px_rgba(124,58,237,0.6)] text-lg flex items-center justify-center gap-3"
              >
                Enter The Studio <ArrowRight size={20} />
              </Link>
              <Link
                to="/feed"
                className="w-full sm:w-auto px-10 py-5 rounded-full font-bold transition-all duration-300 bg-slate-900/80 backdrop-blur-md text-white hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-lg flex items-center justify-center gap-3"
              >
                Explore The Wall <Globe2 size={20} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. BEFORE/AFTER SHOWCASE */}
      <section className="w-full bg-slate-900/50 border-y border-white/5 py-24 overflow-hidden relative">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-6xl mx-auto px-4 relative z-10"
        >
          <motion.div variants={item} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Stop Context Switching.</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">See how the VibeText tuning engine instantly translates your raw thoughts into the perfect emotional tone.</p>
          </motion.div>

          <motion.div variants={item} className="flex flex-col lg:flex-row gap-8 items-start bg-slate-950/50 border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl">
            {/* Pill selector — horizontal scroll on mobile, vertical on desktop */}
            <div className="w-full lg:w-1/3 flex flex-row overflow-x-auto lg:flex-col gap-3 snap-x no-scrollbar pb-4 lg:pb-0">
              {beforeAfterExamples.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBeforeAfter(idx)}
                  className={`flex-shrink-0 snap-center w-[185px] lg:w-full text-left px-5 py-4 rounded-2xl transition-all border ${activeBeforeAfter === idx
                    ? 'bg-primary-900/30 border-primary-500/50 text-white shadow-[0_0_20px_rgba(124,58,237,0.15)]'
                    : 'bg-slate-900/30 border-white/5 text-slate-400 hover:bg-slate-800/50'
                    }`}
                >
                  <div className="font-bold mb-1 text-sm">{ex.title}</div>
                  <div className="text-xs flex items-center gap-2 opacity-80">
                    <Zap size={12} className={activeBeforeAfter === idx ? 'text-primary-400' : ''} />
                    {ex.level}
                  </div>
                </button>
              ))}
            </div>

            {/* Display View */}
            <div className="w-full lg:w-2/3 flex flex-col gap-4 relative">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-slate-800 rounded-full border-4 border-slate-950 flex items-center justify-center z-10 shadow-xl">
                <ArrowRight size={20} className="text-slate-400 rotate-90 md:rotate-0" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full relative">
                {/* Raw */}
                <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 flex flex-col pt-10 relative">
                  <div className="absolute top-0 left-0 bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-br-lg rounded-tl-2xl">RAW INPUT</div>
                  <p className="text-slate-400 italic text-lg leading-relaxed pt-2">
                    &quot;{beforeAfterExamples[activeBeforeAfter].raw}&quot;
                  </p>
                </div>

                {/* Tuned */}
                <div className="bg-gradient-to-br from-primary-900/20 to-accent-900/20 rounded-2xl p-6 border border-primary-500/30 flex flex-col pt-10 relative shadow-[inset_0_0_40px_rgba(124,58,237,0.05)]">
                  <div className="absolute top-0 left-0 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg rounded-tl-2xl flex items-center gap-1 shadow-md">
                    <Sparkles size={12} /> TUNED: {beforeAfterExamples[activeBeforeAfter].vibe.toUpperCase()}
                  </div>
                  <p className="text-white font-medium text-lg md:text-xl leading-relaxed pt-2 drop-shadow-md">
                    &quot;{beforeAfterExamples[activeBeforeAfter].tuned}&quot;
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. DEEP DIVE FEATURES */}
      <section className="w-full max-w-7xl mx-auto px-4 py-28 relative">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div variants={item} className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Built for the Culture.</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">We aren't just another layer on top of ChatGPT. VibeText is a fully crowdsourced, socially-driven text ecosystem.</p>
          </motion.div>

          <div className="flex flex-col gap-16">

            {/* Feature 1: The Vibe Wall (Split Hero Layout) */}
            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-black">
                <img src="/feature-wall.png" alt="Decentralized Vibe Wall" className="w-full h-auto object-cover opacity-90 transition-transform duration-700 hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 to-transparent mix-blend-overlay pointer-events-none" />
              </div>
              <div className="order-1 lg:order-2 flex flex-col items-start px-4 lg:px-8">
                <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-400 mb-6 border border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
                  <Globe2 size={28} />
                </div>
                <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">The Global Vibe Wall</h3>
                <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-8">
                  Join a fully community-driven ecosystem. Publish your tuned snippets to the global Vibe Wall. Get upvotes, shares, and saves from the community to climb the Trending charts and establish your reputation as a master wordsmith.
                </p>
                <Link to="/feed" className="text-pink-400 hover:text-pink-300 font-bold flex items-center gap-2 group text-lg">
                  Explore Trending Vibes <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
                </Link>
              </div>
            </motion.div>

            {/* Group 2: The standard grid for remaining features */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Feature: Authenticity Engine */}
              <motion.div variants={item} className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 hover:bg-slate-900/60 transition-all group flex flex-col relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-yellow-500/10 blur-[50px] rounded-full transition-all group-hover:bg-yellow-500/20" />
                <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-400 mb-6 border border-yellow-500/20">
                  <Shield size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Authentic Reviews</h3>
                <p className="text-slate-400 leading-relaxed mb-8 flex-1">
                  Every vibe undergoes rigorous community verification. Users rate outputs from 1-5 stars and drop community notes.
                </p>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} className="text-slate-700" /></div>
                  </div>
                  <div className="text-xs text-slate-500 border-l-2 border-slate-800 pl-3 italic">
                    "This slang is accurate." — Note
                  </div>
                </div>
              </motion.div>

              {/* Feature: Marketplace */}
              <motion.div variants={item} className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 hover:bg-slate-900/60 transition-all group flex flex-col relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent-500/10 blur-[50px] rounded-full transition-all group-hover:bg-accent-500/20" />
                <div className="w-14 h-14 bg-accent-500/10 rounded-2xl flex items-center justify-center text-accent-400 mb-6 border border-accent-500/20">
                  <Users size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Vibe Bounties</h3>
                <p className="text-slate-400 leading-relaxed mb-8 flex-1">
                  Can't find the vibe? Request it. Users post bounties for specific tones, upvote the best requests, and top creators fulfill them.
                </p>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-slate-200">"Tired SysAdmin"</span>
                    <span className="text-xs bg-slate-800 text-accent-400 px-2 py-1 rounded-md font-bold">421 Votes</span>
                  </div>
                </div>
              </motion.div>

              {/* Feature: Weekly Drops */}
              <motion.div variants={item} className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 hover:bg-slate-900/60 transition-all group flex flex-col relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/10 blur-[50px] rounded-full transition-all group-hover:bg-primary-500/20" />
                <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-400 mb-6 border border-primary-500/20">
                  <Gift size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Weekly Drops</h3>
                <p className="text-slate-400 leading-relaxed mb-8 flex-1">
                  Every week, we curate specialized limited-time vibes based on internet culture. Compete to generate the highest rated.
                </p>
                <div className="bg-gradient-to-r from-primary-900/30 to-slate-900 p-4 rounded-xl border border-primary-500/30 flex items-center gap-3 mt-auto">
                  <Wand2 size={20} className="text-primary-400 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-white">This Week: Pop Princess</div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. WORKFLOW / HOW IT WORKS */}
      <section className="w-full bg-slate-950 border-t border-b border-white/5 py-28 relative overflow-hidden">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-5xl mx-auto px-4 relative z-10 text-center"
        >
          <motion.h2 variants={item} className="text-4xl font-bold text-white mb-16">Effortless Workflow.</motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-[45%] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-primary-500/30 to-transparent -translate-y-1/2 z-0" />

            <motion.div variants={item} className="flex flex-col items-center relative z-10 bg-slate-900/80 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 shadow-xl">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">1. Dump Context</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Paste your raw emails, messy thoughts, or bullet points directly into the Studio editor.</p>
            </motion.div>

            <motion.div variants={item} className="flex flex-col items-center relative z-10 bg-slate-900/80 p-8 rounded-3xl border border-white/5 backdrop-blur-sm shadow-[0_0_50px_rgba(124,58,237,0.1)]">
              <div className="w-16 h-16 bg-primary-500/10 rounded-2xl border border-primary-500/20 flex items-center justify-center text-primary-400 mb-6 shadow-xl">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">2. Dial Intensity</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Choose from 10+ standard vibes or a weekly drop, then slide the intensity from 'chill' to 'unhinged'.</p>
            </motion.div>

            <motion.div variants={item} className="flex flex-col items-center relative z-10 bg-slate-900/80 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
              <div className="w-16 h-16 bg-accent-500/10 rounded-2xl border border-accent-500/20 flex items-center justify-center text-accent-400 mb-6 shadow-xl">
                <Share2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">3. Share &amp; Export</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Export native PNGs to Instagram, copy-paste directly to Slack, or publish straight to the Vibe Wall.</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 5. COMMUNITY STATS */}
      <section className="w-full bg-gradient-to-b from-transparent to-primary-950/20 py-24 border-b border-white/5">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="max-w-6xl mx-auto px-4"
        >
          <motion.div variants={item} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">By the Numbers</h2>
            <p className="text-slate-400">Join the fastest-growing contextual text engine network.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div variants={item} className="text-center">
              <h3 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">100k+</h3>
              <p className="text-slate-400 font-medium text-sm md:text-base uppercase tracking-wider">Outputs Tuned</p>
            </motion.div>
            <motion.div variants={item} className="text-center">
              <h3 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">50k+</h3>
              <p className="text-slate-400 font-medium text-sm md:text-base uppercase tracking-wider">Vibes Shared</p>
            </motion.div>
            <motion.div variants={item} className="text-center">
              <h3 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">12k+</h3>
              <p className="text-slate-400 font-medium text-sm md:text-base uppercase tracking-wider">Active Creators</p>
            </motion.div>
            <motion.div variants={item} className="text-center">
              <h3 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">4.8<span className="text-xl">★</span></h3>
              <p className="text-yellow-400/80 font-medium text-sm md:text-base uppercase tracking-wider">Avg Authenticity</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="w-full max-w-5xl mx-auto px-4 py-28 text-center pb-32">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="glassmorphism p-12 md:p-20 rounded-[3rem] relative overflow-hidden shadow-[0_0_60px_rgba(124,58,237,0.15)] border border-primary-500/20"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/30 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-600/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium text-sm mb-6">
              <Lock size={14} /> 100% Free. No credit card required.
            </motion.div>
            <motion.h2 variants={item} className="text-4xl md:text-6xl font-black text-white mb-6">Ready to change the conversation?</motion.h2>
            <motion.p variants={item} className="text-xl text-slate-300 mb-10 max-w-2xl">Create your account to unlock private saving, community upvoting, and access to the Vibe Marketplace.</motion.p>
            <motion.div variants={item}>
              <Link
                to="/tune"
                className="inline-flex items-center gap-3 px-12 py-5 rounded-full font-bold transition-all duration-300 bg-white text-slate-900 hover:scale-105 shadow-xl hover:shadow-2xl text-xl"
              >
                Start Tuning Now <Zap size={20} className="text-primary-600" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 7. GLOBAL FOOTER */}
      <footer className="w-full bg-slate-950 border-t border-white/5 pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
            <div className="md:col-span-1">
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: '20px' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', padding: 1, flexShrink: 0 }}>
                  <div style={{ width: '100%', height: '100%', background: '#080f1e', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: 14, background: 'linear-gradient(to right, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>V</span>
                  </div>
                </div>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>VibeText</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                The global standard for contextual text transformation. Rewrite the web, find your vibe, and join the culture.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="flex flex-col gap-3 text-sm text-slate-400">
                <li><Link to="/tune" className="hover:text-primary-400 transition-colors">The Studio</Link></li>
                <li><Link to="/feed" className="hover:text-primary-400 transition-colors">Vibe Wall</Link></li>
                <li><Link to="/requests" className="hover:text-primary-400 transition-colors">Marketplace</Link></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Weekly Drops</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="flex flex-col gap-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Community Guidelines</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="flex flex-col gap-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-primary-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">
              &copy; {new Date().getFullYear()} VibeText Inc. All rights reserved. Made with <span className="text-red-500">♥</span> on the internet.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-500 hover:text-white transition-colors">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
