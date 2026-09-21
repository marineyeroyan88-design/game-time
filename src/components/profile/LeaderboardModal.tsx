import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { GAMES_LIST } from '../../data/gamesList';
import { soundFx } from '../../utils/audio';
import { X, Trophy, Medal } from 'lucide-react';

const MOCK_GLOBAL_RANKS = [
  { rank: 1, name: 'QuantumApex', score: 98400, badge: '👑', color: '#ffee00', level: 42 },
  { rank: 2, name: 'Vortex_Ninja', score: 87200, badge: '🔥', color: '#ff007f', level: 38 },
  { rank: 3, name: 'CyberGlitch', score: 76500, badge: '⚡', color: '#00f0ff', level: 35 },
  { rank: 4, name: 'HyperNova', score: 65100, badge: '💎', color: '#39ff14', level: 31 },
  { rank: 5, name: 'ChronoRift', score: 54900, badge: '👾', color: '#9d4edd', level: 27 },
];

export const LeaderboardModal: React.FC = () => {
  const { isLeaderboardOpen, setIsLeaderboardOpen, userProfile } = useGame();
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>('overall');

  if (!isLeaderboardOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Global Cyber Leaderboards</h2>
              <p className="text-xs text-slate-400">Hall of fame rankings across all online arenas</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsLeaderboardOpen(false);
              soundFx.playClick();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Game Selection Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedGameFilter('overall')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedGameFilter === 'overall'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Overall Ranking
            </button>
            {GAMES_LIST.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGameFilter(g.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedGameFilter === g.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {g.title}
              </button>
            ))}
          </div>

          {/* Leaderboard Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-950 px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <div className="col-span-2">Rank</div>
              <div className="col-span-6">Player</div>
              <div className="col-span-2 text-center">Level</div>
              <div className="col-span-2 text-right">Score</div>
            </div>

            <div className="divide-y divide-slate-800/60">
              {MOCK_GLOBAL_RANKS.map((item) => (
                <div
                  key={item.rank}
                  className="grid grid-cols-12 items-center px-4 py-3 text-xs hover:bg-slate-850 transition"
                >
                  <div className="col-span-2 font-bold flex items-center gap-1.5">
                    {item.rank === 1 && <Medal className="w-4 h-4 text-yellow-400" />}
                    {item.rank === 2 && <Medal className="w-4 h-4 text-slate-300" />}
                    {item.rank === 3 && <Medal className="w-4 h-4 text-amber-600" />}
                    <span style={{ color: item.color }}>#{item.rank}</span>
                  </div>

                  <div className="col-span-6 flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.badge}
                    </div>
                    <span className="font-bold text-slate-200">{item.name}</span>
                  </div>

                  <div className="col-span-2 text-center font-mono text-cyan-400">Lvl {item.level}</div>
                  <div className="col-span-2 text-right font-mono font-bold text-yellow-400">
                    {item.score.toLocaleString()}
                  </div>
                </div>
              ))}

              {/* Your Personal Rank Row */}
              <div className="grid grid-cols-12 items-center px-4 py-3 text-xs bg-cyan-950/40 border-t-2 border-cyan-500/40">
                <div className="col-span-2 font-bold text-cyan-400">#12</div>
                <div className="col-span-6 flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: userProfile.avatar.color }}
                  >
                    {userProfile.avatar.badge}
                  </div>
                  <span className="font-bold text-cyan-300">{userProfile.username} (YOU)</span>
                </div>
                <div className="col-span-2 text-center font-mono text-cyan-400">Lvl {userProfile.level}</div>
                <div className="col-span-2 text-right font-mono font-bold text-yellow-400">
                  {(
                    Object.values(userProfile.stats.highScores).reduce((a, b) => a + b, 0) || 12400
                  ).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
