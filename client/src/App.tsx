import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TuneForm } from './components/TuneForm';
import { ResultCard } from './components/ResultCard';
import { Sidebar } from './components/Sidebar';
import { AdminPanel } from './components/AdminPanel';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';

function App() {
  const [appView, setAppView] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'tuner' | 'admin'>('tuner');
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleTuneText = async (text: string, country: string, dialect: string, intensity?: string) => {
    setIsLoading(true);
    setResult(null);

    setTimeout(() => {
      let mockResponse = `This is a mocked response for the "\${dialect}" vibe originating in "\${country}" with \${intensity?.toLowerCase()} intensity.\\n\\nOriginal text was:\\n"\${text}"`;
      if (dialect === 'Gen-Z Slang') mockResponse = `no cap, that's literally so valid bestie. straight facts fr fr 💀\\n\\n(Mocked translation of: "\${text}")`;
      if (dialect === 'British Roadman') mockResponse = `bruv, u takin the mick? mans spitting straight facts innit.\\n\\n(Mocked translation of: "\${text}")`;
      setResult(mockResponse);
      setIsLoading(false);
    }, 2000);
  };

  // --- LANDING PAGE RENDER ---
  if (appView === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans scroll-smooth">
        <div className="fixed inset-0 bg-gradient-radial-web3 opacity-60 mix-blend-screen pointer-events-none z-0" />
        <div className="fixed top-0 w-full h-[500px] bg-gradient-to-b from-primary-900/20 to-transparent pointer-events-none z-0" />
        
        <Navbar onLaunch={() => setAppView('app')} />
        <Hero onLaunch={() => setAppView('app')} />
        <HowItWorks />
        <Footer />
      </div>
    );
  }

  // --- DASHBOARD APP RENDER ---
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <div className="fixed inset-0 bg-gradient-radial-web3 opacity-60 mix-blend-screen pointer-events-none z-0" />
      <div className="fixed top-0 w-full h-[300px] bg-gradient-to-b from-primary-900/10 to-transparent pointer-events-none z-0" />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col h-full relative z-10 overflow-y-auto">
        <Navbar isAppView={true} />

        <div className="flex-1 p-6 md:p-12 w-full mx-auto pt-8 md:pt-12">
           {activeTab === 'tuner' ? (
             <div className="w-full flex flex-col items-center max-w-4xl mx-auto">
                <div className="text-center mb-10 w-full">
                  <h2 className="text-4xl font-bold text-white mb-2">VibeTuner Interface</h2>
                  <p className="text-slate-400">Configure parameters, lock in your payment, and execute the text transformation.</p>
                </div>
                
                <TuneForm onSubmit={handleTuneText} isLoading={isLoading} />
                <ResultCard result={result} />
             </div>
           ) : (
             <div className="w-full h-full flex justify-center mt-4">
               <AdminPanel />
             </div>
           )}
        </div>
      </main>
    </div>
  );
}

export default App;
