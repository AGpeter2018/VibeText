import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import Landing from './pages/Landing';
import Feed from './pages/Feed';
import Tune from './pages/Tune';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden font-sans scroll-smooth">
      {/* Background glow layers */}
      <div className="fixed inset-0 bg-gradient-radial-web3 opacity-60 mix-blend-screen pointer-events-none z-0" />
      <div className="fixed top-0 w-full h-[500px] bg-gradient-to-b from-primary-900/20 to-transparent pointer-events-none z-0" />

      {/* Fixed left sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Top navbar (slim, mobile hamburger only) */}
      <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />

      {/* Main content — shifts right on large screens to make room for sidebar */}
      <main
        className="relative z-10 flex flex-col min-h-screen lg:ml-[240px]"
        style={{ paddingTop: 56 }}
      >
        <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/tune" element={<Tune />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/requests" element={<Marketplace />} />
            <Route path="/me" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Footer />
      </main>
    </div>
  );
}

export default App;
