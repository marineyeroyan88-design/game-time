import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import type { PlayerAvatar } from '../../types/game';
import { X, User, Trophy, Sparkles, Edit3, Coins, Award } from 'lucide-react';



const COLOR_PALETTES = [
  '#00f0ff',
  '#ff007f',
  '#39ff14',
  '#ffee00',
  '#9d4edd',
  '#ff7700',
];

const BADGE_ICONS: PlayerAvatar['badge'][] = ['⚡', '🔥', '👑', '👾', '💎', '🚀'];

export const ProfileModal: React.FC = () => {
  const { isProfileModalOpen, setIsProfileModalOpen, userProfile, updateProfile } = useGame();
  const [usernameInput, setUsernameInput] = useState(userProfile.username);

  if (!isProfileModalOpen) return null;

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      updateProfile({ username: usernameInput.trim() });
      soundFx.playClick();
    }
  };

  const handleAvatarChange = (updates: Partial<PlayerAvatar>) => {
    updateProfile({ avatar: { ...userProfile.avatar, ...updates } });
    soundFx.playClick();
  };

  const xpPercent = Math.min(100, Math.floor((userProfile.xp / userProfile.nextLevelXp) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Gamer Profile & Avatar Studio</h2>
              <p className="text-xs text-slate-400">Customize your cyber persona and track career stats</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsProfileModalOpen(false);
              soundFx.playClick();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Gamer Card Preview Header */}
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden flex flex-col sm:flex-row items-center gap-6">
            {/* Custom Avatar Shield Preview */}
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl transition transform hover:scale-105"
                style={{ backgroundColor: userProfile.avatar.color }}
              >
                {userProfile.avatar.badge}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-950 border border-slate-700 text-cyan-400 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                Lvl {userProfile.level}
              </div>
            </div>

            {/* User Level & XP info */}
            <div className="flex-1 w-full text-center sm:text-left flex flex-col gap-2">
              <form onSubmit={handleSaveUsername} className="flex items-center justify-center sm:justify-start gap-2">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-base font-bold text-white px-3 py-1 rounded-xl outline-none focus:border-cyan-500 max-w-[200px]"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                  title="Save Name"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </form>

              {/* XP Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>XP Progress</span>
                <span>
                  {userProfile.xp} / {userProfile.nextLevelXp} XP ({xpPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Avatar Customization Studio */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Avatar Customizer
            </h3>

            {/* Color Palette */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Aura Color</label>
              <div className="flex items-center gap-3">
                {COLOR_PALETTES.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleAvatarChange({ color: c })}
                    className={`w-8 h-8 rounded-xl transition transform hover:scale-110 cursor-pointer ${
                      userProfile.avatar.color === c ? 'ring-2 ring-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Badge Icon Selection */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Badge Symbol</label>
              <div className="flex items-center gap-3">
                {BADGE_ICONS.map((badge) => (
                  <button
                    key={badge}
                    onClick={() => handleAvatarChange({ badge })}
                    className={`w-10 h-10 rounded-xl bg-slate-950 border text-lg flex items-center justify-center transition cursor-pointer ${
                      userProfile.avatar.badge === badge
                        ? 'border-cyan-400 bg-slate-800'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {badge}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Career Stats Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> Career Performance
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase">Games Played</div>
                <div className="text-xl font-bold text-slate-200 mt-1">{userProfile.stats.gamesPlayed}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase">Victories</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">{userProfile.stats.wins}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase">Coins Earned</div>
                <div className="text-xl font-bold text-yellow-400 mt-1 flex items-center justify-center gap-1">
                  <Coins className="w-4 h-4" /> {userProfile.coins}
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase">Achievements</div>
                <div className="text-xl font-bold text-cyan-400 mt-1 flex items-center justify-center gap-1">
                  <Award className="w-4 h-4" /> {userProfile.achievements.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
