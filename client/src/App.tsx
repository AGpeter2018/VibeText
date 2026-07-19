import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import Landing from './pages/Landing';
import Feed from './pages/Feed';
import Tune from './pages/Tune';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Hide sidebar on the public landing page
  const showSidebar = location.pathname !== '/';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans scroll-smooth">
      {/* Background glow layers */}
      <div className="fixed inset-0 bg-gradient-radial-web3 opacity-60 mix-blend-screen pointer-events-none z-0" />
      <div className="fixed top-0 w-full h-[500px] bg-gradient-to-b from-primary-900/20 to-transparent pointer-events-none z-0" />

      {/* Left sidebar — always rendered, but hidden on desktop landing */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isLanding={!showSidebar}
      />

      {/* Top navbar */}
      <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} showSidebar={showSidebar} isLanding={!showSidebar} />

      {/* Main content — shifts right on large screens when sidebar is visible */}
      <main
        className={`relative z-10 flex flex-col min-h-screen transition-all duration-300 overflow-x-hidden ${showSidebar ? 'lg:ml-[240px]' : ''}`}
        style={{ paddingTop: 56 }}
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/tune" element={<div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8"><Tune /></div>} />
          <Route path="/dashboard" element={<div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8"><Dashboard /></div>} />
          <Route path="/requests" element={<div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8"><Marketplace /></div>} />
          <Route path="/me" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
