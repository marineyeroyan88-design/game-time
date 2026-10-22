import React from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { ArrowLeft, Scale, CheckCircle, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';

export const TermsAndConditionsPage: React.FC = () => {
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
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-extrabold uppercase tracking-widest">
            <Scale className="w-4 h-4" /> User Agreement
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Terms & Conditions</h1>
          <p className="text-slate-400 text-xs md:text-sm">Please read these rules and terms before enjoying our free web platform.</p>
        </div>
      </div>

      {/* Terms Body */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur shadow-xl flex flex-col gap-8 text-slate-300 text-sm leading-relaxed">
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h2>1. Acceptance of Terms</h2>
          </div>
          <p>
            By accessing or playing games on Gamers-Time ("gamers-time.online"), you agree to abide by these Terms and Conditions and our Privacy Policy. If you do not agree, you must cease using the site immediately.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2>2. Permitted Use & Conduct</h2>
          </div>
          <p>
            Gamers-Time is provided strictly for personal, non-commercial entertainment. While using the site, you agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-400 text-xs md:text-sm">
            <li>Deploy automated bots, spiders, or malicious scrapers to overwhelm portal servers.</li>
            <li>Exploit vulnerabilities or engage in unauthorized tampering with multiplayer WebRTC rooms.</li>
            <li>Harass, insult, or post hateful speech in live chat rooms or game usernames.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <FileText className="w-5 h-5 text-purple-400" />
            <h2>3. Intellectual Property Rights</h2>
          </div>
          <p>
            All website trademarks, logos, cyber styling, sound effects, and portal infrastructure are the exclusive property of Gamers-Time. Third-party titles, characters, and assets belong to their respective creators and licensors.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2>4. Limitation of Liability</h2>
          </div>
          <p>
            Gamers-Time is provided "AS IS" without warranties of uninterrupted service, speed, or compatibility with any particular browser configuration. We will not be liable for any temporary connection drops or lost progress.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <Scale className="w-5 h-5 text-blue-400" />
            <h2>5. Amendments & Updates</h2>
          </div>
          <p>
            We reserve the right to revise or modify these Terms at any time without prior written notice. Continued usage of Gamers-Time following updates constitutes complete agreement with modified provisions.
          </p>
        </section>
      </div>
    </div>
  );
};
