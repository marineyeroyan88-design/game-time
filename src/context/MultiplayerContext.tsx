import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { GameRoom, RoomPlayer, ChatMessage, GameId } from '../types/game';
import { useGame } from './GameContext';
import { soundFx } from '../utils/audio';

interface MultiplayerContextType {
  currentRoom: GameRoom | null;
  publicRooms: GameRoom[];
  createRoom: (gameId: GameId, roomName: string, isPrivate: boolean, maxPlayers?: number) => void;
  joinRoom: (roomCodeOrId: string) => void;
  leaveRoom: () => void;
  toggleReady: () => void;
  sendChatMessage: (text: string) => void;
  startGameSession: () => void;
  broadcastGameState: (payload: any) => void;
  onGameStateReceived: (callback: (payload: any) => void) => () => void;
}

const DEFAULT_BOT_NAMES = [
  'Vortex_Ninja', 'QuantumApex', 'NeonShadow', 'CyberGlitch', 
  'HyperNova', 'ByteMaster', 'ChronoRift', 'StarlightEcho', 'ZeroKev'
];

const BOT_AVATARS = [
  { helmet: 'mecha-helm' as const, color: '#ff007f', badge: '🔥' as const, bannerBg: 'from-pink-900 to-purple-900' },
  { helmet: 'shadow-ninja' as const, color: '#39ff14', badge: '⚡' as const, bannerBg: 'from-green-900 to-teal-900' },
  { helmet: 'cyber-visor' as const, color: '#00f0ff', badge: '💎' as const, bannerBg: 'from-cyan-900 to-blue-900' },
  { helmet: 'neon-crown' as const, color: '#ffee00', badge: '👑' as const, bannerBg: 'from-yellow-900 to-red-900' },
];

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export const MultiplayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useGame();
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [publicRooms, setPublicRooms] = useState<GameRoom[]>([]);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const stateListenersRef = useRef<Set<(payload: any) => void>>(new Set());

  // Initialize simulated public rooms
  useEffect(() => {
    const mockRooms: GameRoom[] = [
      {
        id: 'room-neon-1',
        code: 'NEON99',
        name: '⚡ Cyber Showdown 4v4',
        gameId: 'neon-strike',
        hostId: 'bot-1',
        maxPlayers: 6,
        isPrivate: false,
        status: 'waiting',
        maxRounds: 3,
        currentRound: 1,
        players: [
          {
            id: 'bot-1',
            username: 'Vortex_Ninja',
            avatar: BOT_AVATARS[0],
            isHost: true,
            isReady: true,
            isBot: true,
            score: 0,
            status: 'lobby',
          },
          {
            id: 'bot-2',
            username: 'QuantumApex',
            avatar: BOT_AVATARS[1],
            isHost: false,
            isReady: true,
            isBot: true,
            score: 0,
            status: 'lobby',
          },
        ],
        messages: [
          {
            id: 'm1',
            senderId: 'bot-1',
            senderName: 'Vortex_Ninja',
            senderBadge: '🔥',
            text: 'Welcome cyber warriors! Ready up when set.',
            timestamp: Date.now() - 30000,
          },
        ],
      },
      {
        id: 'room-slither-1',
        code: 'SLITH88',
        name: '🐍 Slither Mega Arena',
        gameId: 'slither-arena',
        hostId: 'bot-3',
        maxPlayers: 10,
        isPrivate: false,
        status: 'waiting',
        maxRounds: 1,
        currentRound: 1,
        players: [
          {
            id: 'bot-3',
            username: 'NeonShadow',
            avatar: BOT_AVATARS[2],
            isHost: true,
            isReady: true,
            isBot: true,
            score: 0,
            status: 'lobby',
          },
          {
            id: 'bot-4',
            username: 'HyperNova',
            avatar: BOT_AVATARS[3],
            isHost: false,
            isReady: true,
            isBot: true,
            score: 0,
            status: 'lobby',
          },
        ],
        messages: [],
      },
      {
        id: 'room-hockey-1',
        code: 'PUCK1v1',
        name: '🏒 Cyber Air Hockey 1v1 Championship',
        gameId: 'cyber-hockey',
        hostId: 'bot-5',
        maxPlayers: 2,
        isPrivate: false,
        status: 'waiting',
        maxRounds: 5,
        currentRound: 1,
        players: [
          {
            id: 'bot-5',
            username: 'ChronoRift',
            avatar: BOT_AVATARS[1],
            isHost: true,
            isReady: true,
            isBot: true,
            score: 0,
            status: 'lobby',
          },
        ],
        messages: [],
      },
    ];

    setPublicRooms(mockRooms);
  }, []);

  // BroadcastChannel setup for cross-tab multiplayer sync
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('gametime_multiplayer_net');
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'GAME_SYNC') {
          stateListenersRef.current.forEach((cb) => cb(payload));
        } else if (type === 'ROOM_UPDATE') {
          setPublicRooms((prev) => {
            const idx = prev.findIndex((r) => r.id === payload.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = payload;
              return updated;
            }
            return [...prev, payload];
          });
          if (currentRoom && currentRoom.id === payload.id) {
            setCurrentRoom(payload);
          }
        } else if (type === 'CHAT_MSG' && currentRoom && currentRoom.id === payload.roomId) {
          setCurrentRoom((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              messages: [...prev.messages, payload.message],
            };
          });
        }
      };

      return () => {
        channel.close();
      };
    }
  }, [currentRoom]);

  const broadcastRoomUpdate = (room: GameRoom) => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'ROOM_UPDATE', payload: room });
    }
  };

  const createRoom = (gameId: GameId, roomName: string, isPrivate: boolean, maxPlayers = 4) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom: GameRoom = {
      id: `room-${Date.now()}`,
      code,
      name: roomName || `${userProfile.username}'s Arena`,
      gameId,
      hostId: userProfile.username,
      maxPlayers,
      isPrivate,
      status: 'waiting',
      maxRounds: 3,
      currentRound: 1,
      players: [
        {
          id: userProfile.username,
          username: userProfile.username,
          avatar: userProfile.avatar,
          isHost: true,
          isReady: true,
          isBot: false,
          score: 0,
          status: 'lobby',
        },
      ],
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: 'system',
          senderName: 'SYSTEM',
          senderBadge: '⚙️',
          text: `Room created! Room Code: ${code}`,
          timestamp: Date.now(),
          isSystem: true,
        },
      ],
    };

    // Auto add 1 smart bot so room has instant action
    const randomBotName = DEFAULT_BOT_NAMES[Math.floor(Math.random() * DEFAULT_BOT_NAMES.length)];
    const randomAvatar = BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)];
    newRoom.players.push({
      id: `bot-${Date.now()}`,
      username: randomBotName,
      avatar: randomAvatar,
      isHost: false,
      isReady: true,
      isBot: true,
      score: 0,
      status: 'lobby',
    });

    setCurrentRoom(newRoom);
    setPublicRooms((prev) => [newRoom, ...prev]);
    broadcastRoomUpdate(newRoom);
    soundFx.playPowerup();
  };

  const joinRoom = (roomCodeOrId: string) => {
    const targetRoom = publicRooms.find(
      (r) => r.id === roomCodeOrId || r.code === roomCodeOrId.toUpperCase()
    );

    if (!targetRoom) {
      alert('Room not found! Check code or search list.');
      return;
    }

    if (targetRoom.players.length >= targetRoom.maxPlayers) {
      alert('Room is full!');
      return;
    }

    const myPlayer: RoomPlayer = {
      id: userProfile.username,
      username: userProfile.username,
      avatar: userProfile.avatar,
      isHost: false,
      isReady: false,
      isBot: false,
      score: 0,
      status: 'lobby',
    };

    const updatedPlayers = [...targetRoom.players.filter((p) => p.id !== userProfile.username), myPlayer];
    const updatedRoom: GameRoom = {
      ...targetRoom,
      players: updatedPlayers,
      messages: [
        ...targetRoom.messages,
        {
          id: `m-${Date.now()}`,
          senderId: 'system',
          senderName: 'SYSTEM',
          senderBadge: '👋',
          text: `${userProfile.username} joined the lobby!`,
          timestamp: Date.now(),
          isSystem: true,
        },
      ],
    };

    setCurrentRoom(updatedRoom);
    broadcastRoomUpdate(updatedRoom);
    soundFx.playClick();
  };

  const leaveRoom = () => {
    if (!currentRoom) return;

    const remainingPlayers = currentRoom.players.filter((p) => p.id !== userProfile.username);
    if (remainingPlayers.length === 0) {
      setPublicRooms((prev) => prev.filter((r) => r.id !== currentRoom.id));
    } else {
      // Reassign host if host left
      if (remainingPlayers.length > 0 && !remainingPlayers.some((p) => p.isHost)) {
        remainingPlayers[0].isHost = true;
      }
      const updatedRoom: GameRoom = {
        ...currentRoom,
        players: remainingPlayers,
      };
      setPublicRooms((prev) => prev.map((r) => (r.id === currentRoom.id ? updatedRoom : r)));
      broadcastRoomUpdate(updatedRoom);
    }
    setCurrentRoom(null);
    soundFx.playClick();
  };

  const toggleReady = () => {
    if (!currentRoom) return;
    const updatedPlayers = currentRoom.players.map((p) => {
      if (p.id === userProfile.username) {
        return { ...p, isReady: !p.isReady };
      }
      return p;
    });

    const updatedRoom: GameRoom = { ...currentRoom, players: updatedPlayers };
    setCurrentRoom(updatedRoom);
    broadcastRoomUpdate(updatedRoom);
    soundFx.playClick();
  };

  const sendChatMessage = (text: string) => {
    if (!currentRoom || !text.trim()) return;

    const msg: ChatMessage = {
      id: `chat-${Date.now()}`,
      senderId: userProfile.username,
      senderName: userProfile.username,
      senderBadge: userProfile.avatar.badge,
      text: text.trim(),
      timestamp: Date.now(),
    };

    const updatedRoom: GameRoom = {
      ...currentRoom,
      messages: [...currentRoom.messages, msg],
    };

    setCurrentRoom(updatedRoom);
    broadcastRoomUpdate(updatedRoom);

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'CHAT_MSG',
        payload: { roomId: currentRoom.id, message: msg },
      });
    }
  };

  const startGameSession = () => {
    if (!currentRoom) return;
    const updatedRoom: GameRoom = {
      ...currentRoom,
      status: 'in_progress',
      players: currentRoom.players.map((p) => ({ ...p, status: 'playing' })),
    };
    setCurrentRoom(updatedRoom);
    broadcastRoomUpdate(updatedRoom);
    soundFx.playVictory();
  };

  const broadcastGameState = (payload: any) => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'GAME_SYNC', payload });
    }
  };

  const onGameStateReceived = (callback: (payload: any) => void) => {
    stateListenersRef.current.add(callback);
    return () => {
      stateListenersRef.current.delete(callback);
    };
  };

  return (
    <MultiplayerContext.Provider
      value={{
        currentRoom,
        publicRooms,
        createRoom,
        joinRoom,
        leaveRoom,
        toggleReady,
        sendChatMessage,
        startGameSession,
        broadcastGameState,
        onGameStateReceived,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = () => {
  const ctx = useContext(MultiplayerContext);
  if (!ctx) throw new Error('useMultiplayer must be used within MultiplayerProvider');
  return ctx;
};
