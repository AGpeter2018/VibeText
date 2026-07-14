import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import Landing from './pages/Landing';
import Feed from './pages/Feed';
import Tune from './pages/Tune';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden font-sans scroll-smooth flex flex-col">
      <div className="fixed inset-0 bg-gradient-radial-web3 opacity-60 mix-blend-screen pointer-events-none z-0" />
      <div className="fixed top-0 w-full h-[500px] bg-gradient-to-b from-primary-900/20 to-transparent pointer-events-none z-0" />

      <Navbar />
      <main className="flex-1 relative z-10 overflow-y-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/tune" element={<Tune />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/requests" element={<Marketplace />} />
          <Route path="/me" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
