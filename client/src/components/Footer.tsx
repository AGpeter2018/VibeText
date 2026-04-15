import { Sparkle, Globe, MessageSquare, Fingerprint } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-32 relative z-10 bg-slate-950/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-500 p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center">
              <Sparkle size={14} className="text-accent-400" />
            </div>
          </div>
          <span className="text-lg tracking-tight font-semibold text-white">
            VibeText
          </span>
        </div>

        {/* Copyright */}
        <p className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} VibeText Protocol. All rights reserved.
        </p>

        {/* Socials */}
        <div className="flex gap-4">
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <Globe size={18} />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <MessageSquare size={18} />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <Fingerprint size={18} />
          </a>
        </div>

      </div>
    </footer>
  );
}
