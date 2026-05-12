import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
import { Footer } from "../components/Footer";
import Dashboard from "./dashBoard";

const LandingPage = () => {
    //   const [appView, setAppView] = useState<'landing' | 'app'>('landing');
   return (
       <>
           {/* {appView === 'landing' ? ( */}
                <div className="min-h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans scroll-smooth">
                <div className="fixed inset-0 bg-gradient-radial-web3 opacity-60 mix-blend-screen pointer-events-none z-0" />
                <div className="fixed top-0 w-full h-[500px] bg-gradient-to-b from-primary-900/20 to-transparent pointer-events-none z-0" />
        
                <Navbar  />
                <Hero  />
                <HowItWorks />
                <Footer />
            </div>
            )
        
       </>
    );
}
export default LandingPage