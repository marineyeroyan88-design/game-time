import React, { createContext, useContext, useState, useEffect } from 'react';
import type { GameId, GameCategory, UserProfile, DailyQuest } from '../types/game';
import { soundFx } from '../utils/audio';

interface GameContextType {
  activeGameId: GameId | null;
  setActiveGameId: (id: GameId | null) => void;
  selectedCategory: GameCategory;
  setSelectedCategory: (cat: GameCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userProfile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  recordHighScore: (gameId: GameId, score: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isLeaderboardOpen: boolean;
  setIsLeaderboardOpen: (open: boolean) => void;
  isRoomLobbyOpen: boolean;
  setIsRoomLobbyOpen: (open: boolean) => void;
  quests: DailyQuest[];
  claimQuestReward: (questId: string) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  username: 'CyberPlayer_' + Math.floor(1000 + Math.random() * 9000),
  level: 5,
  xp: 450,
  nextLevelXp: 1000,
  coins: 1250,
  avatar: {
    helmet: 'cyber-visor',
    color: '#00f0ff',
    badge: '⚡',
    bannerBg: 'from-cyan-900 to-purple-900',
  },
  stats: {
    gamesPlayed: 24,
    wins: 9,
    highScores: {
      'neon-strike': 4800,
      'slither-arena': 12400,
      'pixel-dash': 310,
      'cyber-hockey': 7,
      'block-rush': 18500,
    },
  },
  achievements: ['first_win', 'score_10k', 'customizer'],
};

const INITIAL_QUESTS: DailyQuest[] = [
  {
    id: 'q1',
    title: 'Play 3 Games',
    description: 'Jump into any online arena game',
    rewardXp: 150,
    rewardCoins: 200,
    progress: 1,
    target: 3,
    isCompleted: false,
  },
  {
    id: 'q2',
    title: 'Score 5,000 in Neon Strike',
    description: 'Defeat enemies and collect energy orbs',
    rewardXp: 300,
    rewardCoins: 400,
    progress: 4800,
    target: 5000,
    isCompleted: false,
  },
  {
    id: 'q3',
    title: 'Slither Leaderboard Top 3',
    description: 'Reach top 3 position in Slither Arena',
    rewardXp: 500,
    rewardCoins: 600,
    progress: 1,
    target: 1,
    isCompleted: true,
  },
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isRoomLobbyOpen, setIsRoomLobbyOpen] = useState<boolean>(false);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('gametime_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_PROFILE;
      }
    }
    return DEFAULT_PROFILE;
  });

  const [quests, setQuests] = useState<DailyQuest[]>(INITIAL_QUESTS);

  useEffect(() => {
    localStorage.setItem('gametime_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    soundFx.setMuted(newMute);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({
      ...prev,
      ...updates,
      avatar: updates.avatar ? { ...prev.avatar, ...updates.avatar } : prev.avatar,
    }));
  };

  const addXp = (amount: number) => {
    setUserProfile((prev) => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let nextXp = prev.nextLevelXp;

      while (newXp >= nextXp) {
        newXp -= nextXp;
        newLevel += 1;
        nextXp = Math.floor(nextXp * 1.3);
        soundFx.playVictory();
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        nextLevelXp: nextXp,
      };
    });
  };

  const addCoins = (amount: number) => {
    setUserProfile((prev) => ({
      ...prev,
      coins: prev.coins + amount,
    }));
    soundFx.playCoin();
  };

  const recordHighScore = (gameId: GameId, score: number) => {
    setUserProfile((prev) => {
      const currentHigh = prev.stats.highScores[gameId] || 0;
      if (score > currentHigh) {
        soundFx.playPowerup();
        return {
          ...prev,
          stats: {
            ...prev.stats,
            highScores: {
              ...prev.stats.highScores,
              [gameId]: score,
            },
          },
        };
      }
      return prev;
    });
  };

  const claimQuestReward = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && !q.isCompleted && q.progress >= q.target) {
          addXp(q.rewardXp);
          addCoins(q.rewardCoins);
          return { ...q, isCompleted: true };
        }
        return q;
      })
    );
  };

  return (
    <GameContext.Provider
      value={{
        activeGameId,
        setActiveGameId,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        userProfile,
        updateProfile,
        addXp,
        addCoins,
        recordHighScore,
        isMuted,
        toggleMute,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isLeaderboardOpen,
        setIsLeaderboardOpen,
        isRoomLobbyOpen,
        setIsRoomLobbyOpen,
        quests,
        claimQuestReward,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
