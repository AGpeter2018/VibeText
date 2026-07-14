import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { Menu, Bell, Search, Zap, X, LayoutDashboard, LogOut } from 'lucide-react';

interface NavbarProps {
  onOpenSidebar: () => void;
}

export function Navbar({ onOpenSidebar }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/feed?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          zIndex: 30,
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          background: 'rgba(8, 15, 30, 0.92)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 16,
          paddingRight: 20,
          gap: 10,
        }}
      >
        {/* Hamburger — mobile only */}
        <button
          onClick={onOpenSidebar}
          aria-label="Open menu"
          className="lg:hidden"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, borderRadius: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#94a3b8', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <Menu size={18} />
        </button>

        {/* Search bar — hidden on mobile, expands on click */}
        <form
          onSubmit={handleSearch}
          style={{
            flex: 1,
            maxWidth: 400,
            marginLeft: 8,
            display: isSearchOpen || window.innerWidth >= 640 ? 'flex' : 'none',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '0 12px',
            height: 36,
          }}
          className="sm:flex hidden"
        >
          <Search size={14} color="#475569" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search vibes, styles…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit',
            }}
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </form>

        {/* Mobile search icon */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="sm:hidden"
          style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}
        >
          <Search size={18} />
        </button>

        <div style={{ flex: 1 }} />

        {/* Right side actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* ⚡ Quick "New Vibe" CTA */}
          <Link
            to="/tune"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              border: 'none', borderRadius: 20,
              color: '#fff', fontWeight: 600, fontSize: 12,
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(124,58,237,0.35)',
              flexShrink: 0,
            }}
          >
            <Zap size={13} />
            <span className="hidden sm:inline">New Vibe</span>
          </Link>

          {/* 🔔 Notifications */}
          <button
            aria-label="Notifications"
            style={{
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 8,
              background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer',
            }}
          >
            <Bell size={17} />
            {/* Notification badge */}
            <span style={{
              position: 'absolute', top: 4, right: 4,
              width: 7, height: 7, borderRadius: '50%',
              background: '#7c3aed',
              border: '1.5px solid #080f1e',
            }} />
          </button>

          {/* 👤 User avatar + dropdown */}
          {isAuthenticated && user ? (
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 2 }}
              >
                {user.picture ? (
                  <img src={user.picture} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.4)' }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 12, border: '2px solid rgba(124,58,237,0.4)' }}>
                    {user.name.charAt(0)}
                  </div>
                )}
              </button>

              {/* Profile dropdown */}
              {isProfileOpen && (
                <div style={{
                  position: 'absolute', top: 44, right: 0,
                  width: 200,
                  background: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '6px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                  zIndex: 100,
                }}>
                  <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 }}>
                    <p style={{ margin: 0, color: '#fff', fontWeight: 600, fontSize: 12 }}>{user.name}</p>
                    <p style={{ margin: 0, color: '#475569', fontSize: 11 }}>{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsProfileOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, color: '#cbd5e1', textDecoration: 'none', fontSize: 12, fontWeight: 500 }}
                  >
                    <LayoutDashboard size={14} color="#7c3aed" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { setIsProfileOpen(false); logout(); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: 12, fontWeight: 500 }}
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              style={{
                padding: '7px 16px',
                background: 'rgba(124,58,237,0.15)',
                border: '1px solid rgba(124,58,237,0.35)',
                borderRadius: 20, color: '#a78bfa',
                fontWeight: 600, fontSize: 12, cursor: 'pointer',
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Mobile search bar expansion */}
      {isSearchOpen && (
        <div style={{
          position: 'fixed', top: 56, left: 0, right: 0, zIndex: 29,
          background: 'rgba(8,15,30,0.96)', padding: '10px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '0 12px', height: 40 }}>
            <Search size={15} color="#475569" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search vibes, styles…"
              autoFocus
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 14, fontFamily: 'inherit' }}
            />
            <button type="button" onClick={() => setIsSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
              <X size={15} />
            </button>
          </form>
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
