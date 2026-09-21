import React from 'react';
import { GAMES_LIST } from '../../data/gamesList';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { Play, Users, Star, Flame, Zap } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { setActiveGameId, setIsRoomLobbyOpen } = useGame();
  const featuredGame = GAMES_LIST.find((g) => g.isFeatured) || GAMES_LIST[0];

  const handlePlayNow = () => {
    setActiveGameId(featuredGame.id);
    soundFx.playVictory();
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
      {/* Background Image with Gradient Mask */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${featuredGame.coverImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />

      {/* Content Area */}
      <div className="relative z-10 p-6 md:p-10 flex flex-col items-start gap-4 max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" /> Featured Multiplayer
          </span>
          <span className="flex items-center gap-1 text-xs text-yellow-400 font-bold bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700">
            <Star className="w-3.5 h-3.5 fill-yellow-400" /> {featuredGame.rating}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
          {featuredGame.title}
        </h1>

        <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-xl">
          {featuredGame.description}
        </p>

        {/* Live Status & Quick Action Buttons */}
        <div className="flex items-center gap-4 text-xs font-semibold text-cyan-400 mt-1">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>{featuredGame.playersOnline.toLocaleString()} Players Live</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-300">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Instant Room Match</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handlePlayNow}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm px-7 py-3 rounded-2xl shadow-xl shadow-cyan-500/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" /> PLAY NOW
          </button>

          <button
            onClick={() => {
              setIsRoomLobbyOpen(true);
              soundFx.playClick();
            }}
            className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm px-5 py-3 rounded-2xl transition cursor-pointer"
          >
            <Users className="w-4 h-4 text-purple-400" /> Create Lobby
          </button>
        </div>
      </div>
    </div>
  );
};
