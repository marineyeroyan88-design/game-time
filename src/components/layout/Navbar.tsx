import React from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { Search, Volume2, VolumeX, Users, Trophy, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    userProfile,
    isMuted,
    toggleMute,
    setIsProfileModalOpen,
    setIsLeaderboardOpen,
    setIsRoomLobbyOpen,
    setActiveGameId,
  } = useGame();

  const handleLogoClick = () => {
    setActiveGameId(null);
    soundFx.playClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
        >
          <img
            src="./logo.png"
            alt="Gamers-Time Logo"
            className="h-10 w-auto object-contain rounded-xl group-hover:scale-105 transition transform shadow-lg shadow-cyan-500/20 border border-slate-700/50"
          />
          <div className="hidden sm:block">
            <div className="text-xl font-extrabold tracking-wider text-white flex items-center gap-1">
              GAMERS-<span className="text-neon-gradient">TIME</span>
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-cyan-400/80 font-mono tracking-widest uppercase">
              PlayHop Cyber Hub
            </div>
          </div>
        </button>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games, multiplayer rooms, categories..."
            className="w-full bg-slate-900/90 border border-slate-700/70 focus:border-cyan-400/80 text-xs text-slate-200 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 outline-none transition shadow-inner"
          />
        </div>

        {/* Action Shortcuts & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Mute Toggle Button */}
          <button
            onClick={toggleMute}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-cyan-400 transition"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Multiplayer Rooms Modal Trigger */}
          <button
            onClick={() => {
              setIsRoomLobbyOpen(true);
              soundFx.playClick();
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 transition transform hover:scale-105"
          >
            <Users className="w-4 h-4 text-purple-200" />
            <span className="hidden sm:inline">Rooms & Match</span>
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={() => {
              setIsLeaderboardOpen(true);
              soundFx.playClick();
            }}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-amber-400 transition"
            title="Global Leaderboards"
          >
            <Trophy className="w-4 h-4" />
          </button>

          {/* User Profile Card Button */}
          <button
            onClick={() => {
              setIsProfileModalOpen(true);
              soundFx.playClick();
            }}
            className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-1.5 pr-3 rounded-xl transition group"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow"
              style={{ backgroundColor: userProfile.avatar.color || '#00f0ff' }}
            >
              {userProfile.avatar.badge}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-200 truncate max-w-[100px] group-hover:text-cyan-400">
                {userProfile.username}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Lvl {userProfile.level}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
