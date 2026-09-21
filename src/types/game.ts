export type GameId = string;

export type GameCategory = 'All' | 'Multiplayer' | 'Action' | 'Shooter' | 'Driving' | 'Simulation' | 'Arcade' | 'Puzzle' | 'Sports';

export interface GameInfo {
  id: GameId;
  title: string;
  category: GameCategory;
  thumbnail: string;
  coverImage: string;
  playersOnline: number;
  rating: number;
  description: string;
  tags: string[];
  controls: { key: string; action: string }[];
  isFeatured?: boolean;
  previewGif?: string;
  screenshots?: string[];
  iframeUrl?: string;
}

export interface PlayerAvatar {
  helmet: 'cyber-visor' | 'neon-crown' | 'arcade-hero' | 'shadow-ninja' | 'mecha-helm';
  color: string; // hex string or gradient key
  badge: '⚡' | '🔥' | '👑' | '👾' | '💎' | '🚀';
  bannerBg: string;
}

export interface UserProfile {
  username: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  avatar: PlayerAvatar;
  coins: number;
  stats: {
    gamesPlayed: number;
    wins: number;
    highScores: Record<string, number>;
  };
  achievements: string[]; // achievement IDs
}

export interface RoomPlayer {
  id: string;
  username: string;
  avatar: PlayerAvatar;
  isHost: boolean;
  isReady: boolean;
  isBot: boolean;
  score: number;
  status: 'lobby' | 'playing' | 'eliminated' | 'finished';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderBadge: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface GameRoom {
  id: string;
  code: string;
  name: string;
  gameId: GameId;
  hostId: string;
  maxPlayers: number;
  players: RoomPlayer[];
  status: 'waiting' | 'starting' | 'in_progress' | 'ended';
  isPrivate: boolean;
  messages: ChatMessage[];
  maxRounds: number;
  currentRound: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  rewardCoins: number;
  progress: number;
  target: number;
  isCompleted: boolean;
}
