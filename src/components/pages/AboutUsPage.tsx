import React from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { ArrowLeft, Sparkles, Gamepad2, Zap, Users, Globe2, Award, Heart } from 'lucide-react';

export const AboutUsPage: React.FC = () => {
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
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Who We Are
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">About Gamers-Time</h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
            The next-generation cyber gaming portal built for zero-download, instant browser multiplayer fun across desktop, tablet, and mobile.
          </p>
        </div>
      </div>

      {/* Core Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-3 shadow-xl backdrop-blur">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Zero Friction</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No 50GB downloads, no installations, and no registrations required. Click any game and jump right into the action in seconds.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-3 shadow-xl backdrop-blur">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Multiplayer Rooms</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create custom private and public multiplayer arenas to compete head-to-head or cooperate with friends worldwide.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-3 shadow-xl backdrop-blur">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Globe2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">350+ Curated Titles</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            From tactical FPS combat and Roblox-style obbies to extreme demolition derby and cozy puzzles, every game is verified for top performance.
          </p>
        </div>
      </div>

      {/* Story & Mission Section */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur shadow-xl flex flex-col gap-6 text-slate-300 text-sm leading-relaxed">
        <div className="flex items-center gap-2 text-base font-bold text-white">
          <Gamepad2 className="w-5 h-5 text-cyan-400" />
          <h2>Our Mission</h2>
        </div>
        <p>
          Gamers-Time was founded with a singular vision: to bring back the magic of classic arcade web portals into the modern era with sleek cyberpunk aesthetics, silky smooth 60 FPS gameplay, and global multiplayer integration.
        </p>
        <p>
          Whether you have five minutes between classes or hours to master leaderboards with your squad, Gamers-Time delivers instant thrills directly in your browser without paywalls or restrictive barriers.
        </p>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Built for passion and competitive gameplay
          </div>
          <div className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-1" /> for gamers everywhere
          </div>
        </div>
      </div>
    </div>
  );
};
