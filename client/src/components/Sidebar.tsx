import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { AuthModal } from './AuthModal';
import {
  Radio, Zap, Store, LayoutDashboard, Home,
  LogOut, LogIn, ChevronRight,
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/feed', label: 'Vibe Wall', icon: Radio },
  { to: '/tune', label: 'Studio', icon: Zap },
  { to: '/requests', label: 'Marketplace', icon: Store },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, authOnly: true },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isLanding?: boolean;
}

export function Sidebar({ isOpen, onClose, isLanding = false }: SidebarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const visibleLinks = NAV_LINKS.filter(l => !l.authOnly || isAuthenticated);

  const handleLogout = () => {
    onClose();
    logout();
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(3px)',
          }}
        />
      )}

      {/* Sidebar panel */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: 240,
          zIndex: 50,
          background: '#080f1e',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          // Mobile: slide in/out. Desktop App: always visible
          transform: isOpen ? 'translateX(0)' : undefined,
        }}
        className={`
          transition-transform duration-300 ease-in-out
          -translate-x-full ${!isLanding ? 'lg:translate-x-0' : ''}
          ${isOpen ? '!translate-x-0' : ''}
        `}
      >
        {/* Brand Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link to="/" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', padding: 1, flexShrink: 0 }}>
              <div style={{ width: '100%', height: '100%', background: '#080f1e', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 16, background: 'linear-gradient(to right, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>V</span>
              </div>
            </div>
            <div>
              <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1 }}>VibeText</p>
              <p style={{ margin: 0, color: '#475569', fontSize: 10, letterSpacing: '0.05em', marginTop: 2 }}>AI Text Engine</p>
            </div>
          </Link>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          <p style={{ margin: '0 0 8px 10px', color: '#334155', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Navigation</p>
          {visibleLinks.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: 13.5,
                  marginBottom: 2,
                  color: active ? '#fff' : '#94a3b8',
                  background: active ? 'rgba(124,58,237,0.18)' : 'transparent',
                  border: active ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
              >
                <Icon size={17} color={active ? '#a78bfa' : '#475569'} strokeWidth={active ? 2.5 : 2} />
                <span style={{ flex: 1 }}>{label}</span>
                {active && <ChevronRight size={14} color="#7c3aed" />}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 10px' }}>
          {isAuthenticated && user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', marginBottom: 6 }}>
                {user.picture ? (
                  <img src={user.picture} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #1e293b', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 12, border: '2px solid #334155', flexShrink: 0 }}>
                    {user.name.charAt(0)}
                  </div>
                )}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ margin: 0, color: '#e2e8f0', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                  <p style={{ margin: 0, color: '#475569', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: '#f87171', fontWeight: 500, fontSize: 13 }}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => { onClose(); setIsAuthOpen(true); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 600, fontSize: 13, justifyContent: 'center' }}
            >
              <LogIn size={15} />
              Sign In
            </button>
          )}
        </div>
      </aside>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
