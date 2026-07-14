import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { Sidebar } from './Sidebar';
import { Menu, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 50,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(2, 6, 23, 0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 24px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', padding: 1 }}>
              <div style={{ width: '100%', height: '100%', background: '#020617', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 16, background: 'linear-gradient(to right, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>V</span>
              </div>
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '-0.3px' }}>VibeText</span>
          </Link>

          {/* Desktop nav links (hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-6">
            <Link to="/feed" className="text-slate-300 hover:text-white font-medium transition-colors text-sm">Vibe Wall</Link>
            <Link to="/tune" className="text-slate-300 hover:text-white font-medium transition-colors text-sm">Studio</Link>
            <Link to="/requests" className="text-slate-300 hover:text-white font-medium transition-colors text-sm">Marketplace</Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="text-slate-300 hover:text-white font-medium transition-colors text-sm">Dashboard</Link>
            )}
          </div>

          {/* Right side: Avatar + Logout (desktop) | Hamburger (mobile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isAuthenticated && user ? (
              <>
                <Link to="/dashboard" title="Dashboard" style={{ display: 'flex' }}>
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #334155' }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 14, border: '2px solid #334155' }}>
                      {user.name.charAt(0)}
                    </div>
                  )}
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="hidden sm:flex"
                  style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8 }}
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="hidden sm:block"
                style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 50, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}
              >
                Sign In
              </button>
            )}

            {/* Hamburger button — always visible on mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSignIn={() => setIsAuthOpen(true)}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
