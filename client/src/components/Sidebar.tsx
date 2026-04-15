import { Sparkle, Mic, ShieldAlert } from 'lucide-react';

interface SidebarProps {
  activeTab: 'tuner' | 'admin';
  setActiveTab: (tab: 'tuner' | 'admin') => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-white/5 glassmorphism h-full flex flex-col pt-8 pb-6 px-4 z-20 hidden md:flex">
      
      {/* Brand */}
      <div className="flex items-center gap-2 mb-12 pl-2">
         <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">
                V
              </span>
            </div>
          </div>
        <span className="text-2xl tracking-tight font-bold text-white">
          VibeText
        </span>
      </div>

      {/* Tabs */}
      <nav className="flex flex-col gap-2 flex-1">
        <button 
          onClick={() => setActiveTab('tuner')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer \${
            activeTab === 'tuner' 
              ? 'bg-primary-600/20 text-primary-400 border border-primary-500/20' 
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Mic size={18} />
          AI Tuner
        </button>

        <button 
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer \${
            activeTab === 'admin' 
              ? 'bg-accent-500/20 text-accent-400 border border-accent-500/20' 
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
          }`}
        >
          <ShieldAlert size={18} />
          Protocol Admin
        </button>
      </nav>

    </aside>
  );
}
