import React from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { ArrowLeft, AlertCircle, Info, ShieldAlert, Cpu, ExternalLink } from 'lucide-react';

export const DisclaimerPage: React.FC = () => {
  const { setCurrentPage } = useGame();

  const handleBack = () => {
    setCurrentPage('home');
    soundFx.playClick();
  };

  return (
    <div className="w-full flex flex-col gap-8 max-w-4xl mx-auto py-4">
      {/* Back Button */}
      <div>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" /> Back to Home
        </button>
      </div>

      {/* Header Banner */}
      <div className="relative bg-slate-900/90 border border-slate-800/80 rounded-3xl p-8 overflow-hidden backdrop-blur shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-widest">
            <AlertCircle className="w-4 h-4" /> Legal Notice
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Website Disclaimer</h1>
          <p className="text-slate-400 text-xs md:text-sm">Important disclaimers concerning content, intellectual property, and performance.</p>
        </div>
      </div>

      {/* Disclaimer Body */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur shadow-xl flex flex-col gap-8 text-slate-300 text-sm leading-relaxed">
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <Info className="w-5 h-5 text-cyan-400" />
            <h2>1. Entertainment & Informational Purposes Only</h2>
          </div>
          <p>
            All games, media, interactive demonstrations, audio tracks, and simulations available on Gamers-Time are published solely for general entertainment and amusement purposes.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2>2. Copyright & Intellectual Property Disclaimer</h2>
          </div>
          <p>
            Gamers-Time hosts titles created by independent game developers and external distribution networks (such as Playgama). All trademarks, logos, audio tracks, and game visuals remain the registered properties of their respective rights holders.
          </p>
          <p className="text-xs text-slate-400">
            If you are a copyright owner or an agent thereof and believe that any game or material on our platform infringes upon your copyright, please reach out directly via our Contact Us portal with DMCA details for expedited review and prompt takedown.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h2>3. Browser Compatibility & Performance</h2>
          </div>
          <p>
            While we optimize games to achieve smooth 60 FPS performance via WebGL and HTML5, hardware performance varies across individual graphic processors (GPUs), operating systems, and network latencies. Gamers-Time does not guarantee identical frame rates across all consumer hardware.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <ExternalLink className="w-5 h-5 text-amber-400" />
            <h2>4. External Links & Third-Party Embeds</h2>
          </div>
          <p>
            Some games utilize external sandboxed frames. Gamers-Time does not control and bears no responsibility for external advertising networks or privacy policies governed by third-party game hosting servers.
          </p>
        </section>
      </div>
    </div>
  );
};
