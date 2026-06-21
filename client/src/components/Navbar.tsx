import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { LogOut } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glassmorphism border-b-white/5 border-b-[1px]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between pointer-events-auto">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">
                V
              </span>
            </div>
          </div>
          <span className="text-xl tracking-tight font-semibold text-white">
            VibeText
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link 
            to="/feed"
            className="hidden sm:block text-slate-300 hover:text-white font-medium transition-colors"
          >
            Vibe Wall
          </Link>
          <Link 
            to="/tune"
            className="hidden sm:block text-slate-300 hover:text-white font-medium transition-colors"
          >
            Studio
          </Link>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border border-slate-700" />
              <button 
                onClick={logout}
                className="text-slate-400 hover:text-white transition-colors p-2"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-5 py-2.5 rounded-full font-medium transition-all duration-300 bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  );
}
