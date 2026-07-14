import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, LogOut, Zap, Radio, Store, LayoutDashboard, Home } from 'lucide-react';

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
  onSignIn: () => void;
}

export function Sidebar({ isOpen, onClose, onSignIn }: SidebarProps) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    onClose();
    logout();
  };

  const visibleLinks = NAV_LINKS.filter(l => !l.authOnly || isAuthenticated);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 998,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Sidebar panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: '280px',
          zIndex: 999,
          background: '#0f172a',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '64px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', padding: 1 }}>
              <div style={{ width: '100%', height: '100%', background: '#0f172a', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 14, background: 'linear-gradient(to right, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>V</span>
              </div>
            </div>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>VibeText</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User strip */}
        {isAuthenticated && user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
            {user.picture ? (
              <img src={user.picture} alt={user.name} style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #334155' }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', border: '2px solid #334155' }}>
                {user.name.charAt(0)}
              </div>
            )}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ margin: 0, color: '#fff', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
              <p style={{ margin: 0, color: '#64748b', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {visibleLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 12,
                color: '#cbd5e1',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              <Icon size={18} color="#a78bfa" strokeWidth={2} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer', color: '#f87171', fontWeight: 600, fontSize: 14 }}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => { onClose(); onSignIn(); }}
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
