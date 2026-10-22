import React from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { ArrowLeft, Shield, Lock, Eye, Cookie, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
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
          className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" /> Back to Home
        </button>
      </div>

      {/* Header Banner */}
      <div className="relative bg-slate-900/90 border border-slate-800/80 rounded-3xl p-8 overflow-hidden backdrop-blur shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-extrabold uppercase tracking-widest">
            <Shield className="w-4 h-4" /> Legal & Transparency
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-slate-400 text-xs md:text-sm">Last updated: October 2026 • Effective immediately</p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur shadow-xl flex flex-col gap-8 text-slate-300 text-sm leading-relaxed">
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <Eye className="w-5 h-5 text-cyan-400" />
            <h2>1. Information We Collect</h2>
          </div>
          <p>
            At Gamers-Time, your privacy is our core priority. We operate with minimal data collection principles:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-400 text-xs md:text-sm">
            <li><strong className="text-slate-200">Local Gameplay Profile:</strong> Usernames, custom badges, level rankings, and high scores are stored locally in your browser's <code className="text-cyan-400 font-mono">localStorage</code>.</li>
            <li><strong className="text-slate-200">Session Data:</strong> Temporary peer IDs generated solely for WebRTC peer-to-peer multiplayer rooms. These are cleared immediately upon exiting the room.</li>
            <li><strong className="text-slate-200">No Passwords or Financial Info:</strong> We do not ask for or store credit cards, bank accounts, or sensitive private credentials to play any free game.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <Cookie className="w-5 h-5 text-amber-400" />
            <h2>2. Cookies and Storage Technologies</h2>
          </div>
          <p>
            We use strictly necessary browser storage mechanisms to save your gaming sound settings, sound volume preferences, and saved high scores so your progress persists between visits.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <Lock className="w-5 h-5 text-purple-400" />
            <h2>3. Third-Party Game Providers</h2>
          </div>
          <p>
            Certain online games are streamed through secured HTML5 sandbox iframes from verified gaming networks (such as Playgama). These partners adhere to COPPA, GDPR, and standard web safety guidelines.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2>4. Children's Privacy (COPPA Compliance)</h2>
          </div>
          <p>
            Gamers-Time provides family-friendly and age-appropriate web experiences. We do not knowingly solicit or collect personally identifiable information from children under 13.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2>5. Contacting Us About Privacy</h2>
          </div>
          <p>
            If you have questions or concerns about our Privacy Policy or data handling, reach out anytime via our Contact Us portal or email us at <span className="text-cyan-400 font-mono">privacy@gamers-time.online</span>.
          </p>
        </section>
      </div>
    </div>
  );
};
