import React from 'react';
import { useGame } from '../../context/GameContext';
import type { GameCategory } from '../../types/game';
import { soundFx } from '../../utils/audio';
import { Flame, Users, Swords, Gamepad2, Puzzle, Dumbbell, Sparkles, CheckCircle2 } from 'lucide-react';

interface CategoryItem {
  id: GameCategory;
  label: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'All', label: 'All Games', icon: <Sparkles className="w-4 h-4 text-cyan-400" /> },
  { id: 'Multiplayer', label: 'Multiplayer', icon: <Users className="w-4 h-4 text-purple-400" /> },
  { id: 'Action', label: 'Action & Arena', icon: <Swords className="w-4 h-4 text-rose-400" /> },
  { id: 'Arcade', label: 'Arcade & Speed', icon: <Gamepad2 className="w-4 h-4 text-emerald-400" /> },
  { id: 'Puzzle', label: 'Puzzle & Strategy', icon: <Puzzle className="w-4 h-4 text-amber-400" /> },
  { id: 'Sports', label: 'Sports 1v1', icon: <Dumbbell className="w-4 h-4 text-blue-400" /> },
];

export const Sidebar: React.FC = () => {
  const { selectedCategory, setSelectedCategory, setActiveGameId, quests, claimQuestReward } = useGame();

  const handleCategorySelect = (cat: GameCategory) => {
    setSelectedCategory(cat);
    setActiveGameId(null);
    soundFx.playClick();
  };

  return (
    <aside className="w-full lg:w-64 flex flex-col gap-6 shrink-0">
      {/* Categories Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur shadow-xl">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-3 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-rose-500" /> Game Categories
        </h3>
        <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Daily Quests Tracker */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur shadow-xl hidden lg:block">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Daily Quests</span>
          <span className="text-[10px] bg-amber-400/10 text-amber-300 border border-amber-400/20 px-2 py-0.5 rounded-full font-mono">
            +XP & COINS
          </span>
        </h3>
        <div className="flex flex-col gap-3">
          {quests.map((q) => {
            const canClaim = !q.isCompleted && q.progress >= q.target;
            return (
              <div
                key={q.id}
                className="bg-slate-950/70 border border-slate-800/70 rounded-xl p-3 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{q.title}</span>
                  {q.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-[10px] text-cyan-400 font-mono">
                      {q.progress}/{q.target}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">{q.description}</p>
                {canClaim && (
                  <button
                    onClick={() => {
                      claimQuestReward(q.id);
                      soundFx.playPowerup();
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-[11px] py-1 rounded-lg shadow transition transform hover:scale-102"
                  >
                    CLAIM +{q.rewardXp} XP
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
