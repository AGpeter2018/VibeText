import { useState } from 'react';

import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { AdminPanel } from '../components/AdminPanel';
import { TuneForm } from '../components/TuneForm';
import { ResultCard } from '../components/ResultCard';

import useApiTune from '../hooks/useApiTune';

// import UsewriteRequestTune from '../hooks/Write-hooks/useWriteRequestTune';

const Dashboard = () => {
  
    const [activeTab, setActiveTab] = useState<'tuner' | 'admin'>('tuner');
    const {isLoading, result, handleTuneText} = useApiTune()
      
   
    // --- DASHBOARD APP RENDER ---
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <div className="fixed inset-0 bg-gradient-radial-web3 opacity-60 mix-blend-screen pointer-events-none z-0" />
      <div className="fixed top-0 w-full h-[300px] bg-gradient-to-b from-primary-900/10 to-transparent pointer-events-none z-0" />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col h-full relative z-10 overflow-y-auto">
        <Navbar  />

        <div className="flex-1 p-6 md:p-12 w-full mx-auto pt-8 md:pt-12">
           {activeTab === 'tuner' ? (
             <div className="w-full flex flex-col items-center max-w-7xl mx-auto">
                <div className="text-center mb-10 w-full">
                  <h2 className="text-4xl font-bold text-white mb-2">VibeTuner Interface</h2>
                  <p className="text-slate-400">Configure parameters, lock in your payment, and execute the text transformation.</p>
                </div>
                
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <TuneForm onSubmit={handleTuneText} isLoading={isLoading} />
                  <ResultCard result={result} isLoading={isLoading} />
                </div>
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
};  

export default Dashboard;