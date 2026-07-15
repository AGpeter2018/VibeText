import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { Menu, Bell, Search, Zap, LayoutDashboard, LogOut } from 'lucide-react';

interface NavbarProps {
  onOpenSidebar: () => void;
  showSidebar?: boolean;
}

const SAMPLE_NOTIFICATIONS = [
  { id: '1', text: 'Someone upvoted your vibe!', time: '2m ago', read: false },
  { id: '2', text: 'New weekly vibe drop is live 🎉', time: '1h ago', read: false },
  { id: '3', text: 'Your post hit 10 upvotes!', time: '3h ago', read: true },
];

export function Navbar({ onOpenSidebar, showSidebar = false }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
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
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <>
      <header
        className={`fixed top-0 right-0 z-30 h-14 flex items-center px-4 pr-5 gap-3 border-b border-white/5 transition-all duration-300 ${showSidebar ? 'left-0 lg:left-[240px]' : 'left-0'
          }`}
        style={{
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          background: 'rgba(8, 15, 30, 0.92)',
        }}
      >
        {/* Hamburger — mobile only */}
        <button
          onClick={onOpenSidebar}
          aria-label="Open menu"
          className="lg:hidden flex-shrink-0"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, borderRadius: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#94a3b8', cursor: 'pointer',
          }}
        >
          <Menu size={18} />
        </button>

        {/* Search bar — centered, grows to fill available space */}
        <form
          onSubmit={handleSearch}
          style={{
            flex: 1,
            maxWidth: 420,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 10,
            padding: '0 4px 0 12px',
            height: 36,
            minWidth: 0,
          }}
        >
          <Search size={14} color="#475569" style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search vibes…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#e2e8f0',
              fontSize: 13,
              fontFamily: 'inherit',
              minWidth: 0,
            }}
          />
          <button
            type="submit"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 7,
              background: searchQuery.trim() ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'rgba(255,255,255,0.07)',
              border: 'none', cursor: searchQuery.trim() ? 'pointer' : 'default',
              color: searchQuery.trim() ? '#fff' : '#475569',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            <Search size={12} />
          </button>
        </form>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

          {/* ⚡ Quick "New Vibe" CTA */}
          <Link
            to="/tune"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 13px',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              borderRadius: 20,
              color: '#fff', fontWeight: 600, fontSize: 12,
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(124,58,237,0.3)',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            <Zap size={12} />
            <span className="hidden sm:inline">New Vibe</span>
          </Link>

          {/* 🔔 Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
              aria-label="Notifications"
              style={{
                position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34, borderRadius: 8,
                background: isNotifOpen ? 'rgba(124,58,237,0.15)' : 'transparent',
                border: 'none', color: '#64748b', cursor: 'pointer',
              }}
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#7c3aed', border: '1.5px solid #080f1e',
                }} />
              )}
            </button>

            {/* Notification dropdown */}
            {isNotifOpen && (
              <div style={{
                position: 'absolute', top: 42, right: 0,
                width: 280,
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, overflow: 'hidden',
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                zIndex: 100,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', fontSize: 11, fontWeight: 500 }}>
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: n.read ? 'transparent' : 'rgba(124,58,237,0.06)',
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                  }}>
                    {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', flexShrink: 0, marginTop: 4 }} />}
                    {n.read && <span style={{ width: 6, flexShrink: 0 }} />}
                    <div>
                      <p style={{ margin: 0, color: n.read ? '#94a3b8' : '#e2e8f0', fontSize: 12, lineHeight: 1.4 }}>{n.text}</p>
                      <p style={{ margin: '3px 0 0', color: '#475569', fontSize: 10 }}>{n.time}</p>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#475569', fontSize: 12 }}>No notifications yet</div>
                )}
              </div>
            )}
          </div>

          {/* 👤 User avatar + dropdown */}
          {isAuthenticated && user ? (
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 2 }}
              >
                {user.picture ? (
                  <img src={user.picture} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.4)' }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 12, border: '2px solid rgba(124,58,237,0.4)' }}>
                    {user.name.charAt(0)}
                  </div>
                )}
              </button>

              {isProfileOpen && (
                <div style={{
                  position: 'absolute', top: 44, right: 0,
                  width: 200,
                  background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: '6px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.5)', zIndex: 100,
                }}>
                  <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 }}>
                    <p style={{ margin: 0, color: '#fff', fontWeight: 600, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                    <p style={{ margin: '2px 0 0', color: '#475569', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                  </div>
                  <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, color: '#cbd5e1', textDecoration: 'none', fontSize: 12, fontWeight: 500 }}>
                    <LayoutDashboard size={14} color="#7c3aed" /> Dashboard
                  </Link>
                  <button
                    onClick={() => { setIsProfileOpen(false); logout(); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: 12, fontWeight: 500 }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              style={{
                padding: '7px 16px',
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: 20, color: '#a78bfa',
                fontWeight: 600, fontSize: 12, cursor: 'pointer',
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
