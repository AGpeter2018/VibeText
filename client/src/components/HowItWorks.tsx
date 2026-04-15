import { motion } from 'framer-motion';
import { Wallet, Globe2, Zap } from 'lucide-react';

const STEPS = [
  {
    icon: <Wallet className="text-primary-400 w-8 h-8" />,
    title: "1. Connect",
    description: "Securely link your MetaMask or Preferred Web3 wallet. Instant access, zero passwords."
  },
  {
    icon: <Globe2 className="text-accent-400 w-8 h-8" />,
    title: "2. Target",
    description: "Dial in your text. Select any country on Earth, and pinpoint the exact cultural vibe you want."
  },
  {
    icon: <Zap className="text-yellow-400 w-8 h-8" />,
    title: "3. Transform",
    description: "Pay the micro-fee of 0.01 ETH and our AI backend instantly rewrites your text."
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto relative z-10 font-sans">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
        <p className="text-slate-400 max-w-xl mx-auto">A fully decentralized bridge bringing raw AI transformation to your fingertips.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {STEPS.map((step, idx) => (
          <motion.div 
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.2, duration: 0.5 }}
            className="glassmorphism p-8 rounded-3xl flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors border-white/5"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-2">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold text-white">{step.title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
