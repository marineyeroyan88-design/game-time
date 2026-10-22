import React, { createContext, useContext, useState, useEffect } from 'react';
import type { GameId, GameCategory, UserProfile, DailyQuest, PageView } from '../types/game';
import { soundFx } from '../utils/audio';

interface GameContextType {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
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
  username: 'owner',
  isOwner: true,
  role: 'Owner & Supreme Ruler',
  level: 999999999,
  xp: 999999999,
  nextLevelXp: 999999999,
  coins: 999999999,
  avatar: {
    helmet: 'neon-crown',
    color: '#eab308', // Regal Gold
    badge: '👑', // King
    bannerBg: 'from-amber-600 via-yellow-500 to-amber-700',
  },
  stats: {
    gamesPlayed: 99999,
    wins: 99999,
    highScores: {
      'neon-strike': 999999,
      'slither-arena': 999999,
      'pixel-dash': 999999,
      'cyber-hockey': 999,
      'block-rush': 999999,
    },
  },
  achievements: ['owner_crown', 'first_win', 'score_10k', 'customizer', 'god_mode'],
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
  const [currentPage, setCurrentPage] = useState<PageView>('home');
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
        const parsed = JSON.parse(saved);
        // Ensure owner privileges and level 999999999 apply
        if (parsed.username === 'owner' || !parsed.isOwner) {
          return {
            ...DEFAULT_PROFILE,
            ...parsed,
            username: 'owner',
            isOwner: true,
            level: 999999999,
            role: 'Owner & Supreme Ruler',
            avatar: {
              ...DEFAULT_PROFILE.avatar,
              badge: '👑',
              color: '#eab308',
            },
          };
        }
        return parsed;
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const roomParam = params.get('room') || (hash.includes('room=') ? hash.split('room=')[1]?.split('&')[0] : null);
      if (roomParam) {
        setCurrentPage('original-game');
      }
    }
  }, []);

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
        currentPage,
        setCurrentPage,
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
