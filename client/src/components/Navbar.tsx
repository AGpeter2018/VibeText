import { Menu, Bell } from 'lucide-react';

interface NavbarProps {
  onOpenSidebar: () => void;
}

export function Navbar({ onOpenSidebar }: NavbarProps) {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        zIndex: 30,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(8,15,30,0.88)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 20,
        gap: 12,
      }}
    >
      {/* Hamburger — only shows on mobile (hidden on lg+) */}
      <button
        onClick={onOpenSidebar}
        aria-label="Open menu"
        className="lg:hidden"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#94a3b8',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <Menu size={18} />
      </button>

      {/* Page title / breadcrumb area */}
      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          aria-label="Notifications"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'transparent',
            border: 'none',
            color: '#475569',
            cursor: 'pointer',
          }}
        >
          <Bell size={17} />
        </button>
      </div>
    </header>
  );
}
