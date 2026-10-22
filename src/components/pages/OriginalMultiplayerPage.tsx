import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import {
  ArrowLeft,
  Users,
  Zap,
  Volume2,
  VolumeX,
  Trophy,
  MessageSquare,
  Send,
  RefreshCw,
  Copy,
  Check,
  Radio,
  Swords,
  Crown,
  Play,
  Share2,
  UserCheck,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  score: number;
  kills: number;
  deaths: number;
  color: string;
  badge: string;
  isBot: boolean;
  isHost?: boolean;
  isOwner?: boolean;
  level: number;
  weapon: 'rifle' | 'shotgun' | 'railgun' | 'rocket';
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
  reloadTimer: number;
  dashCooldown: number;
  overdriveTimer: number;
  quadDamageTimer: number;
  chatMsg?: { text: string; timer: number };
  respawnTimer?: number;
}

interface Bullet {
  id: string;
  ownerId: string;
  ownerName: string;
  isOwnerBullet: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  damage: number;
  range: number;
  traveled: number;
  isRocket?: boolean;
}

interface Explosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: 'health' | 'shield' | 'overdrive' | 'quad' | 'rocket';
  color: string;
  label: string;
  icon: string;
  active: boolean;
  respawnTime: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  vy: number;
}

interface KillEvent {
  id: string;
  killer: string;
  victim: string;
  weapon: string;
  isKillerOwner?: boolean;
  isVictimOwner?: boolean;
}

interface RoomMember {
  id: string;
  name: string;
  color: string;
  badge: string;
  level: number;
  isHost: boolean;
  isReady: boolean;
  isBot: boolean;
  isOwner?: boolean;
}

interface GameRoomData {
  code: string;
  name: string;
  hostId: string;
  hostName: string;
  maxPlayers: number;
  status: 'lobby' | 'playing';
  players: RoomMember[];
}

const ARENA_WIDTH = 1200;
const ARENA_HEIGHT = 700;

interface WeaponConfig {
  name: string;
  maxAmmo: number;
  fireRate: number;
  damage: number;
  speed: number;
  spread: number;
  reloadTime: number;
  color: string;
  isRocket?: boolean;
  pellets?: number;
}

const WEAPONS: Record<'rifle' | 'shotgun' | 'railgun' | 'rocket', WeaponConfig> = {
  rifle: { name: 'Pulse Rifle', maxAmmo: 30, fireRate: 110, damage: 20, speed: 17, spread: 0.05, reloadTime: 1200, color: '#00f0ff' },
  shotgun: { name: 'Scatter Shotgun', maxAmmo: 8, fireRate: 600, damage: 16, speed: 15, spread: 0.35, reloadTime: 1600, color: '#f59e0b', pellets: 6 },
  railgun: { name: 'Viper Railgun', maxAmmo: 5, fireRate: 850, damage: 75, speed: 28, spread: 0.01, reloadTime: 2000, color: '#a855f7' },
  rocket: { name: 'Havoc Rocket', maxAmmo: 4, fireRate: 900, damage: 85, speed: 11, spread: 0.02, reloadTime: 2200, color: '#ef4444', isRocket: true }
};

const OBSTACLES = [
  { x: 260, y: 160, w: 100, h: 100 },
  { x: 840, y: 160, w: 100, h: 100 },
  { x: 260, y: 440, w: 100, h: 100 },
  { x: 840, y: 440, w: 100, h: 100 },
  { x: 550, y: 280, w: 100, h: 140 }
];

const BOT_PRESETS = [
  { name: 'NeonViper', color: '#ec4899', badge: '🔥', level: 45, weapon: 'shotgun' as const },
  { name: 'CyberGlitch', color: '#3b82f6', badge: '⚡', level: 38, weapon: 'rifle' as const },
  { name: 'GhostSniper', color: '#8b5cf6', badge: '🎯', level: 52, weapon: 'railgun' as const },
  { name: 'ApexTitan', color: '#10b981', badge: '👾', level: 60, weapon: 'rocket' as const }
];

export const OriginalMultiplayerPage: React.FC = () => {
  const { userProfile, updateProfile, setCurrentPage, addXp, addCoins, isMuted, toggleMute } = useGame();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Name input before joining or hosting
  const [playerNameInput, setPlayerNameInput] = useState(userProfile.username || '');
  const [nameError, setNameError] = useState('');

  // Page mode: 'rooms' (browse/create) -> 'lobby' (room waiting) -> 'playing' (in match)
  const [viewState, setViewState] = useState<'rooms' | 'lobby' | 'playing'>('rooms');

  // Room details
  const [currentRoom, setCurrentRoom] = useState<GameRoomData | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [newRoomName, setNewRoomName] = useState(`${userProfile.username}'s Arena`);
  const [maxPlayersChoice, setMaxPlayersChoice] = useState(6);
  const [publicRooms, setPublicRooms] = useState<GameRoomData[]>([
    {
      code: 'ALPHA-7',
      name: '⚡ Cyber Elite 4v4 Showdown',
      hostId: 'bot-host-1',
      hostName: 'ViperCommander',
      maxPlayers: 8,
      status: 'lobby',
      players: [
        { id: 'bot-host-1', name: 'ViperCommander', color: '#ec4899', badge: '🔥', level: 65, isHost: true, isReady: true, isBot: true },
        { id: 'bot-guest-1', name: 'CyberKnight', color: '#3b82f6', badge: '⚡', level: 42, isHost: false, isReady: true, isBot: true }
      ]
    },
    {
      code: 'NEON-99',
      name: '👑 High-Stakes Deathmatch',
      hostId: 'bot-host-2',
      hostName: 'NeonShadow',
      maxPlayers: 6,
      status: 'lobby',
      players: [
        { id: 'bot-host-2', name: 'NeonShadow', color: '#06b6d4', badge: '💎', level: 58, isHost: true, isReady: true, isBot: true },
        { id: 'bot-guest-2', name: 'GlitchPhantom', color: '#a855f7', badge: '👾', level: 39, isHost: false, isReady: false, isBot: true }
      ]
    }
  ]);

  // Inviting link & toast state
  const [copiedLink, setCopiedLink] = useState(false);
  const [detectedInviteCode, setDetectedInviteCode] = useState<string | null>(null);

  // In-Game match state
  const [selectedWeapon, setSelectedWeapon] = useState<'rifle' | 'shotgun' | 'railgun' | 'rocket'>('rifle');
  const [ping, setPing] = useState(24);
  const [killFeed, setKillFeed] = useState<KillEvent[]>([]);
  const [scoreboardOpen, setScoreboardOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: string; text: string; isOwner?: boolean; isHost?: boolean }[]>([
    { sender: 'SYSTEM', text: 'Welcome to Cyber Rivals! Lock and load.' }
  ]);
  const [screenShake, setScreenShake] = useState(0);

  // Sync channel ref
  const syncChannelRef = useRef<BroadcastChannel | null>(null);
  const lastShotTimeRef = useRef(0);

  // Core Game State ref for 60fps canvas loop
  const stateRef = useRef({
    localPlayer: {
      id: userProfile.username,
      name: userProfile.username,
      x: 150 + Math.random() * 100,
      y: 300 + Math.random() * 100,
      vx: 0,
      vy: 0,
      angle: 0,
      hp: 100,
      maxHp: 100,
      shield: userProfile.isOwner ? 100 : 50,
      maxShield: 100,
      score: 0,
      kills: 0,
      deaths: 0,
      color: userProfile.isOwner ? '#eab308' : userProfile.avatar.color || '#00f0ff',
      badge: userProfile.avatar.badge || '👑',
      isBot: false,
      isHost: false,
      isOwner: Boolean(userProfile.isOwner),
      level: userProfile.level,
      weapon: 'rifle' as const,
      ammo: WEAPONS.rifle.maxAmmo,
      maxAmmo: WEAPONS.rifle.maxAmmo,
      isReloading: false,
      reloadTimer: 0,
      dashCooldown: 0,
      overdriveTimer: 0,
      quadDamageTimer: 0,
    } as Player,
    remotePlayers: new Map<string, Player>(),
    bots: [] as Player[],
    bullets: [] as Bullet[],
    explosions: [] as Explosion[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    powerups: [
      { id: 'p1', x: 200, y: 350, type: 'health' as const, color: '#10b981', label: '+HP', icon: '💚', active: true, respawnTime: 0 },
      { id: 'p2', x: 1000, y: 350, type: 'shield' as const, color: '#3b82f6', label: '+SHIELD', icon: '🛡️', active: true, respawnTime: 0 },
      { id: 'p3', x: 600, y: 120, type: 'quad' as const, color: '#a855f7', label: 'QUAD DMG', icon: '💥', active: true, respawnTime: 0 },
      { id: 'p4', x: 600, y: 580, type: 'overdrive' as const, color: '#eab308', label: 'OVERDRIVE', icon: '⚡', active: true, respawnTime: 0 },
      { id: 'p5', x: 600, y: 350, type: 'rocket' as const, color: '#ef4444', label: 'HAVOC ROCKET', icon: '🚀', active: true, respawnTime: 0 }
    ] as PowerUp[],
    keys: { w: false, a: false, s: false, d: false, space: false },
    mouse: { x: 600, y: 350, isDown: false },
    lastSyncTime: 0,
  });

  // Check URL query parameters or hash on mount for invite links (?room=CODE)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const codeFromUrl = params.get('room') || (hash.includes('room=') ? hash.split('room=')[1]?.split('&')[0] : null);

      if (codeFromUrl) {
        const cleanCode = codeFromUrl.toUpperCase();
        setDetectedInviteCode(cleanCode);
        setJoinCodeInput(cleanCode);
      }
    }
  }, []);

  // Sync playerNameInput with userProfile
  useEffect(() => {
    if (userProfile.username && !playerNameInput) {
      setPlayerNameInput(userProfile.username);
    }
  }, [userProfile.username, playerNameInput]);

  // Ping jitter simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setPing(Math.floor(18 + Math.random() * 12));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // BroadcastChannel for cross-tab multiplayer sync
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('gametime_original_multiplayer_sync');
      syncChannelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (!payload) return;

        if (type === 'ROOM_CREATED') {
          setPublicRooms((prev) => [payload.room, ...prev.filter((r) => r.code !== payload.room.code)]);
        } else if (type === 'ROOM_UPDATED') {
          setPublicRooms((prev) => prev.map((r) => (r.code === payload.room.code ? payload.room : r)));
          if (currentRoom && currentRoom.code === payload.room.code) {
            setCurrentRoom(payload.room);
          }
        } else if (type === 'ROOM_START_MATCH') {
          if (currentRoom && currentRoom.code === payload.roomCode) {
            // Launch match for all players in this room!
            soundFx.playVictory();
            confetti({ particleCount: 50, spread: 80, origin: { x: 0.5, y: 0.5 } });
            setViewState('playing');
          }
        } else if (type === 'SYNC_PLAYER_STATE') {
          if (currentRoom && payload.room === currentRoom.code) {
            if (payload.player.id === stateRef.current.localPlayer.id) return;
            stateRef.current.remotePlayers.set(payload.player.id, payload.player);
          }
        } else if (type === 'SYNC_PLAYER_SHOOT') {
          if (currentRoom && payload.room === currentRoom.code) {
            if (payload.ownerId === stateRef.current.localPlayer.id) return;
            stateRef.current.bullets.push(payload.bullet);
          }
        } else if (type === 'SYNC_PLAYER_HIT') {
          if (currentRoom && payload.room === currentRoom.code) {
            if (payload.targetId === stateRef.current.localPlayer.id) {
              takeDamage(payload.damage, payload.attackerName, payload.weapon);
            }
          }
        } else if (type === 'SYNC_CHAT') {
          if (currentRoom && payload.room === currentRoom.code) {
            setChatLog((prev) => [...prev.slice(-15), payload]);
            const remote = stateRef.current.remotePlayers.get(payload.senderId);
            if (remote) {
              remote.chatMsg = { text: payload.text, timer: 180 };
            }
          }
        } else if (type === 'SYNC_KILL') {
          if (currentRoom && payload.room === currentRoom.code) {
            addKillEvent(payload.killer, payload.victim, payload.weapon, payload.isKillerOwner, payload.isVictimOwner);
          }
        }
      };
    }

    return () => {
      if (channel) channel.close();
    };
  }, [currentRoom]);

  // Validate Name before hosting or joining
  const validateAndSaveName = (): boolean => {
    const trimmed = playerNameInput.trim();
    if (!trimmed) {
      setNameError('⚠️ Please write your name before entering or hosting a room!');
      soundFx.playHit();
      return false;
    }
    setNameError('');
    if (trimmed !== userProfile.username) {
      updateProfile({ username: trimmed });
    }
    stateRef.current.localPlayer.name = trimmed;
    stateRef.current.localPlayer.id = trimmed;
    return true;
  };

  // Generate Invite URL
  const getInviteUrl = (code: string) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?room=${code}`;
  };

  // Copy Invite Link to Clipboard
  const handleCopyInviteLink = (codeToCopy?: string) => {
    const code = codeToCopy || currentRoom?.code || 'CYBER-ARENA-1';
    const link = getInviteUrl(code);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    soundFx.playClick();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Host creates a new room
  const handleHostRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAndSaveName()) return;

    const hostName = playerNameInput.trim();
    const generatedCode = `${hostName.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const myHostMember: RoomMember = {
      id: hostName,
      name: hostName,
      color: userProfile.isOwner ? '#eab308' : userProfile.avatar.color || '#00f0ff',
      badge: userProfile.avatar.badge || '👑',
      level: userProfile.level,
      isHost: true,
      isReady: true,
      isBot: false,
      isOwner: Boolean(userProfile.isOwner)
    };

    // Add 2 bots for immediate action
    const initialBots: RoomMember[] = BOT_PRESETS.slice(0, 2).map((b, i) => ({
      id: `bot-slot-${i}`,
      name: b.name,
      color: b.color,
      badge: b.badge,
      level: b.level,
      isHost: false,
      isReady: true,
      isBot: true
    }));

    const newRoom: GameRoomData = {
      code: generatedCode,
      name: newRoomName.trim() || `${hostName}'s Cyber Arena`,
      hostId: hostName,
      hostName: hostName,
      maxPlayers: maxPlayersChoice,
      status: 'lobby',
      players: [myHostMember, ...initialBots]
    };

    setCurrentRoom(newRoom);
    setPublicRooms((prev) => [newRoom, ...prev]);
    stateRef.current.localPlayer.isHost = true;
    setViewState('lobby');
    soundFx.playVictory();

    // Broadcast room creation
    if (syncChannelRef.current) {
      syncChannelRef.current.postMessage({
        type: 'ROOM_CREATED',
        payload: { room: newRoom }
      });
    }
  };

  // Guest joins an existing room
  const handleJoinRoom = (targetCode: string) => {
    if (!validateAndSaveName()) return;

    const guestName = playerNameInput.trim();
    const cleanCode = targetCode.trim().toUpperCase();

    // Find room in public list or create peer room state
    let target = publicRooms.find((r) => r.code === cleanCode);
    if (!target) {
      // Connect to custom room code
      target = {
        code: cleanCode,
        name: `Arena [${cleanCode}]`,
        hostId: 'remote-host',
        hostName: 'Room Host',
        maxPlayers: 8,
        status: 'lobby',
        players: []
      };
    }

    const myGuestMember: RoomMember = {
      id: guestName,
      name: guestName,
      color: userProfile.isOwner ? '#eab308' : userProfile.avatar.color || '#00f0ff',
      badge: userProfile.avatar.badge || '⚡',
      level: userProfile.level,
      isHost: false,
      isReady: true,
      isBot: false,
      isOwner: Boolean(userProfile.isOwner)
    };

    const updatedPlayers = [...target.players.filter((p) => p.name !== guestName), myGuestMember];
    const updatedRoom: GameRoomData = {
      ...target,
      players: updatedPlayers
    };

    setCurrentRoom(updatedRoom);
    stateRef.current.localPlayer.isHost = false;
    setViewState('lobby');
    soundFx.playClick();

    // Broadcast room update
    if (syncChannelRef.current) {
      syncChannelRef.current.postMessage({
        type: 'ROOM_UPDATED',
        payload: { room: updatedRoom }
      });
    }
  };

  // Host launches the match for everyone in the room
  const handleHostStartMatch = () => {
    if (!currentRoom) return;

    soundFx.playVictory();
    confetti({ particleCount: 60, spread: 80, origin: { x: 0.5, y: 0.5 } });

    // Broadcast to all connected tabs with this room code
    if (syncChannelRef.current) {
      syncChannelRef.current.postMessage({
        type: 'ROOM_START_MATCH',
        payload: { roomCode: currentRoom.code }
      });
    }

    setViewState('playing');
  };

  // Add / Remove Bot from room lobby
  const handleAddBotToLobby = () => {
    if (!currentRoom) return;
    const available = BOT_PRESETS.filter((b) => !currentRoom.players.some((p) => p.name === b.name));
    if (available.length === 0) return;

    const chosen = available[0];
    const newBot: RoomMember = {
      id: `bot-${Date.now()}`,
      name: chosen.name,
      color: chosen.color,
      badge: chosen.badge,
      level: chosen.level,
      isHost: false,
      isReady: true,
      isBot: true
    };

    const updated = {
      ...currentRoom,
      players: [...currentRoom.players, newBot]
    };
    setCurrentRoom(updated);
    soundFx.playClick();

    if (syncChannelRef.current) {
      syncChannelRef.current.postMessage({
        type: 'ROOM_UPDATED',
        payload: { room: updated }
      });
    }
  };

  // Leave room
  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    stateRef.current.localPlayer.isHost = false;
    setViewState('rooms');
    soundFx.playClick();
  };

  // Trigger screen shake
  const triggerScreenShake = (amount = 8) => {
    setScreenShake(amount);
  };

  const addFloatingText = (text: string, x: number, y: number, color = '#00f0ff') => {
    stateRef.current.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      color,
      alpha: 1,
      vy: -1.2
    });
  };

  const addKillEvent = (killer: string, victim: string, weapon: string, isKillerOwner = false, isVictimOwner = false) => {
    const event: KillEvent = {
      id: Math.random().toString(),
      killer,
      victim,
      weapon,
      isKillerOwner,
      isVictimOwner
    };
    setKillFeed((prev) => [event, ...prev.slice(0, 4)]);
  };

  const takeDamage = (amount: number, attackerName: string, weaponName: string) => {
    const player = stateRef.current.localPlayer;
    if (player.hp <= 0) return;

    soundFx.playHit();
    triggerScreenShake(7);

    // Absorb with shield first
    if (player.shield > 0) {
      const shieldDmg = Math.min(player.shield, amount);
      player.shield -= shieldDmg;
      amount -= shieldDmg;
      addFloatingText(`-${Math.round(shieldDmg)} SHIELD`, player.x, player.y - 20, '#38bdf8');
    }

    if (amount > 0) {
      player.hp -= amount;
      addFloatingText(`-${Math.round(amount)} HP`, player.x, player.y - 40, '#ef4444');
    }

    if (player.hp <= 0) {
      player.hp = 0;
      player.deaths += 1;
      soundFx.playDefeat();
      addKillEvent(attackerName, player.name, weaponName, false, player.isOwner);

      // Respawn countdown
      setTimeout(() => {
        player.hp = player.maxHp;
        player.shield = player.isOwner ? 100 : 50;
        player.x = 100 + Math.random() * 200;
        player.y = 100 + Math.random() * 400;
        player.ammo = WEAPONS[player.weapon].maxAmmo;
        addFloatingText('RESPAWNED!', player.x, player.y - 30, '#10b981');
      }, 2500);
    }
  };

  const handleSelectWeapon = (w: 'rifle' | 'shotgun' | 'railgun' | 'rocket') => {
    setSelectedWeapon(w);
    stateRef.current.localPlayer.weapon = w;
    stateRef.current.localPlayer.ammo = WEAPONS[w].maxAmmo;
    stateRef.current.localPlayer.maxAmmo = WEAPONS[w].maxAmmo;
    stateRef.current.localPlayer.isReloading = false;
    soundFx.playClick();
  };

  const executeDash = () => {
    const player = stateRef.current.localPlayer;
    if (player.dashCooldown > 0) return;

    soundFx.playPowerup();
    const dashPower = player.overdriveTimer > 0 ? 18 : 14;
    const moveAngle = Math.atan2(
      (stateRef.current.keys.s ? 1 : 0) - (stateRef.current.keys.w ? 1 : 0),
      (stateRef.current.keys.d ? 1 : 0) - (stateRef.current.keys.a ? 1 : 0)
    );

    const actualAngle = (stateRef.current.keys.w || stateRef.current.keys.s || stateRef.current.keys.a || stateRef.current.keys.d)
      ? moveAngle
      : player.angle;

    player.vx += Math.cos(actualAngle) * dashPower;
    player.vy += Math.sin(actualAngle) * dashPower;
    player.dashCooldown = player.overdriveTimer > 0 ? 35 : 70;
  };

  const fireWeapon = () => {
    const player = stateRef.current.localPlayer;
    if (player.hp <= 0 || player.isReloading) return;

    const now = Date.now();
    const wp = WEAPONS[player.weapon];

    if (now - lastShotTimeRef.current < wp.fireRate) return;
    if (player.ammo <= 0) {
      startReload();
      return;
    }

    lastShotTimeRef.current = now;
    player.ammo -= 1;
    soundFx.playShoot();

    const isQuad = player.quadDamageTimer > 0;
    const dmgMultiplier = (isQuad ? 2 : 1) * (player.isOwner ? 1.25 : 1);

    const spawnBullet = (spreadOffset = 0) => {
      const finalAngle = player.angle + spreadOffset;
      const bColor = player.isOwner ? '#fbbf24' : (isQuad ? '#c084fc' : wp.color);

      const bullet: Bullet = {
        id: Math.random().toString(),
        ownerId: player.id,
        ownerName: player.name,
        isOwnerBullet: Boolean(player.isOwner),
        x: player.x + Math.cos(player.angle) * 25,
        y: player.y + Math.sin(player.angle) * 25,
        vx: Math.cos(finalAngle) * wp.speed,
        vy: Math.sin(finalAngle) * wp.speed,
        radius: wp.isRocket ? 6 : (player.weapon === 'railgun' ? 3.5 : 3),
        color: bColor,
        damage: wp.damage * dmgMultiplier,
        range: player.weapon === 'shotgun' ? 320 : 900,
        traveled: 0,
        isRocket: Boolean(wp.isRocket)
      };

      stateRef.current.bullets.push(bullet);

      if (syncChannelRef.current && currentRoom) {
        syncChannelRef.current.postMessage({
          type: 'SYNC_PLAYER_SHOOT',
          payload: { room: currentRoom.code, ownerId: player.id, bullet }
        });
      }
    };

    if (player.weapon === 'shotgun') {
      const pellets = WEAPONS.shotgun.pellets ?? 6;
      for (let i = 0; i < pellets; i++) {
        const spread = (Math.random() - 0.5) * (WEAPONS.shotgun.spread || 0.35);
        spawnBullet(spread);
      }
      triggerScreenShake(4);
    } else {
      const spread = (Math.random() - 0.5) * wp.spread;
      spawnBullet(spread);
      if (wp.isRocket) triggerScreenShake(6);
    }

    player.vx -= Math.cos(player.angle) * 1.5;
    player.vy -= Math.sin(player.angle) * 1.5;
  };

  const startReload = () => {
    const player = stateRef.current.localPlayer;
    if (player.isReloading || player.ammo === player.maxAmmo) return;

    player.isReloading = true;
    player.reloadTimer = WEAPONS[player.weapon].reloadTime;
    addFloatingText('RELOADING...', player.x, player.y - 30, '#94a3b8');
  };

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !currentRoom) return;

    const player = stateRef.current.localPlayer;
    const msg = {
      sender: player.name,
      senderId: player.id,
      text: chatInput.trim(),
      isOwner: player.isOwner,
      isHost: player.isHost
    };

    player.chatMsg = { text: msg.text, timer: 180 };
    setChatLog((prev) => [...prev.slice(-15), msg]);
    setChatInput('');
    setChatOpen(false);

    if (syncChannelRef.current) {
      syncChannelRef.current.postMessage({
        type: 'SYNC_CHAT',
        payload: { room: currentRoom.code, ...msg }
      });
    }
  };

  // Keyboard and mouse listener setup for 'playing' mode
  useEffect(() => {
    if (viewState !== 'playing') return;

    // Initialize in-game bots based on room members
    if (currentRoom) {
      const roomBots = currentRoom.players.filter((p) => p.isBot);
      stateRef.current.bots = roomBots.map((b, i) => ({
        id: b.id,
        name: b.name,
        x: 350 + Math.random() * 500,
        y: 150 + Math.random() * 400,
        vx: 0,
        vy: 0,
        angle: Math.random() * Math.PI * 2,
        hp: 100,
        maxHp: 100,
        shield: 50,
        maxShield: 100,
        score: 100 * (i + 1),
        kills: 0,
        deaths: 0,
        color: b.color,
        badge: b.badge,
        isBot: true,
        level: b.level,
        weapon: 'rifle' as const,
        ammo: WEAPONS.rifle.maxAmmo,
        maxAmmo: WEAPONS.rifle.maxAmmo,
        isReloading: false,
        reloadTimer: 0,
        dashCooldown: 0,
        overdriveTimer: 0,
        quadDamageTimer: 0
      }));
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') stateRef.current.keys.w = true;
      if (k === 'a' || k === 'arrowleft') stateRef.current.keys.a = true;
      if (k === 's' || k === 'arrowdown') stateRef.current.keys.s = true;
      if (k === 'd' || k === 'arrowright') stateRef.current.keys.d = true;
      if (k === ' ' && !chatOpen) {
        stateRef.current.keys.space = true;
        executeDash();
      }
      if (k === 'r' && !chatOpen) startReload();
      if (k === '1' && !chatOpen) handleSelectWeapon('rifle');
      if (k === '2' && !chatOpen) handleSelectWeapon('shotgun');
      if (k === '3' && !chatOpen) handleSelectWeapon('railgun');
      if (k === '4' && !chatOpen) handleSelectWeapon('rocket');
      if (k === 'tab') {
        e.preventDefault();
        setScoreboardOpen((prev) => !prev);
      }
      if (k === 'enter') {
        if (chatOpen) {
          handleSendChat();
        } else {
          setChatOpen(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') stateRef.current.keys.w = false;
      if (k === 'a' || k === 'arrowleft') stateRef.current.keys.a = false;
      if (k === 's' || k === 'arrowdown') stateRef.current.keys.s = false;
      if (k === 'd' || k === 'arrowright') stateRef.current.keys.d = false;
      if (k === ' ') stateRef.current.keys.space = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = ARENA_WIDTH / rect.width;
      const scaleY = ARENA_HEIGHT / rect.height;

      stateRef.current.mouse.x = (e.clientX - rect.left) * scaleX;
      stateRef.current.mouse.y = (e.clientY - rect.top) * scaleY;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        stateRef.current.mouse.isDown = true;
        fireWeapon();
      } else if (e.button === 2) {
        e.preventDefault();
        executeDash();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) stateRef.current.mouse.isDown = false;
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [viewState, chatOpen, currentRoom]);

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    if (viewState !== 'playing') return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const checkObstacleCollision = (nx: number, ny: number, radius: number) => {
      for (const obs of OBSTACLES) {
        if (
          nx + radius > obs.x &&
          nx - radius < obs.x + obs.w &&
          ny + radius > obs.y &&
          ny - radius < obs.y + obs.h
        ) {
          return true;
        }
      }
      return false;
    };

    const gameLoop = () => {
      const player = stateRef.current.localPlayer;

      // 1. Update Player Movement
      if (player.hp > 0) {
        const speed = (player.overdriveTimer > 0 ? 5.8 : 4.0) * (player.isOwner ? 1.15 : 1.0);
        let moveX = 0;
        let moveY = 0;
        if (stateRef.current.keys.w) moveY -= 1;
        if (stateRef.current.keys.s) moveY += 1;
        if (stateRef.current.keys.a) moveX -= 1;
        if (stateRef.current.keys.d) moveX += 1;

        if (moveX !== 0 && moveY !== 0) {
          moveX *= 0.7071;
          moveY *= 0.7071;
        }

        player.vx = player.vx * 0.8 + moveX * speed * 0.2;
        player.vy = player.vy * 0.8 + moveY * speed * 0.2;

        const nextX = player.x + player.vx;
        const nextY = player.y + player.vy;

        if (!checkObstacleCollision(nextX, player.y, 20)) {
          player.x = Math.max(30, Math.min(ARENA_WIDTH - 30, nextX));
        }
        if (!checkObstacleCollision(player.x, nextY, 20)) {
          player.y = Math.max(30, Math.min(ARENA_HEIGHT - 30, nextY));
        }

        player.angle = Math.atan2(stateRef.current.mouse.y - player.y, stateRef.current.mouse.x - player.x);

        if (stateRef.current.mouse.isDown) {
          fireWeapon();
        }

        if (player.dashCooldown > 0) player.dashCooldown -= 1;
        if (player.overdriveTimer > 0) player.overdriveTimer -= 1;
        if (player.quadDamageTimer > 0) player.quadDamageTimer -= 1;

        if (player.isReloading) {
          player.reloadTimer -= 16.6;
          if (player.reloadTimer <= 0) {
            player.isReloading = false;
            player.ammo = player.maxAmmo;
            addFloatingText('RELOADED!', player.x, player.y - 30, '#10b981');
          }
        }

        if (player.chatMsg && player.chatMsg.timer > 0) {
          player.chatMsg.timer -= 1;
        }

        // Broadcast player state across tabs
        const now = Date.now();
        if (now - stateRef.current.lastSyncTime > 100 && syncChannelRef.current && currentRoom) {
          stateRef.current.lastSyncTime = now;
          syncChannelRef.current.postMessage({
            type: 'SYNC_PLAYER_STATE',
            payload: { room: currentRoom.code, player }
          });
        }
      }

      // 2. Update Bots AI
      stateRef.current.bots.forEach((bot) => {
        if (bot.hp <= 0) {
          if (!bot.respawnTimer) bot.respawnTimer = 180;
          bot.respawnTimer -= 1;
          if (bot.respawnTimer <= 0) {
            bot.hp = bot.maxHp;
            bot.shield = 50;
            bot.x = 200 + Math.random() * 800;
            bot.y = 150 + Math.random() * 400;
            bot.respawnTimer = 0;
          }
          return;
        }

        const targets: Player[] = [stateRef.current.localPlayer, ...stateRef.current.bots.filter((b) => b.id !== bot.id)];
        const livingTargets = targets.filter((t) => t.hp > 0);

        if (livingTargets.length > 0) {
          livingTargets.sort((a, b) => {
            const da = (a.x - bot.x) ** 2 + (a.y - bot.y) ** 2;
            const db = (b.x - bot.x) ** 2 + (b.y - bot.y) ** 2;
            return da - db;
          });

          const target = livingTargets[0];
          const dist = Math.hypot(target.x - bot.x, target.y - bot.y);
          const desiredAngle = Math.atan2(target.y - bot.y, target.x - bot.x);

          bot.angle = desiredAngle;

          const botSpeed = 2.4;
          if (dist > 350) {
            bot.vx = Math.cos(desiredAngle) * botSpeed;
            bot.vy = Math.sin(desiredAngle) * botSpeed;
          } else if (dist < 150) {
            bot.vx = -Math.cos(desiredAngle) * botSpeed;
            bot.vy = -Math.sin(desiredAngle) * botSpeed;
          } else {
            bot.vx = Math.cos(desiredAngle + Math.PI / 2) * botSpeed;
            bot.vy = Math.sin(desiredAngle + Math.PI / 2) * botSpeed;
          }

          const nbx = bot.x + bot.vx;
          const nby = bot.y + bot.vy;
          if (!checkObstacleCollision(nbx, bot.y, 20)) bot.x = Math.max(30, Math.min(ARENA_WIDTH - 30, nbx));
          if (!checkObstacleCollision(bot.x, nby, 20)) bot.y = Math.max(30, Math.min(ARENA_HEIGHT - 30, nby));

          if (Math.random() < 0.035 && dist < 500) {
            const wp = WEAPONS[bot.weapon];
            const spread = (Math.random() - 0.5) * 0.12;
            stateRef.current.bullets.push({
              id: Math.random().toString(),
              ownerId: bot.id,
              ownerName: bot.name,
              isOwnerBullet: false,
              x: bot.x + Math.cos(bot.angle) * 22,
              y: bot.y + Math.sin(bot.angle) * 22,
              vx: Math.cos(bot.angle + spread) * wp.speed,
              vy: Math.sin(bot.angle + spread) * wp.speed,
              radius: wp.isRocket ? 6 : 3,
              color: bot.color,
              damage: wp.damage * 0.85,
              range: 800,
              traveled: 0,
              isRocket: Boolean(wp.isRocket)
            });
          }
        }
      });

      // 3. Update Powerups & Collection
      stateRef.current.powerups.forEach((pu) => {
        if (!pu.active) {
          pu.respawnTime -= 16.6;
          if (pu.respawnTime <= 0) pu.active = true;
          return;
        }

        const dist = Math.hypot(pu.x - player.x, pu.y - player.y);
        if (dist < 35 && player.hp > 0) {
          pu.active = false;
          pu.respawnTime = 12000;
          soundFx.playPowerup();

          if (pu.type === 'health') {
            player.hp = Math.min(player.maxHp, player.hp + 40);
            addFloatingText('+40 HEALTH', player.x, player.y - 30, '#10b981');
          } else if (pu.type === 'shield') {
            player.shield = Math.min(player.maxShield, player.shield + 50);
            addFloatingText('+50 SHIELD', player.x, player.y - 30, '#38bdf8');
          } else if (pu.type === 'overdrive') {
            player.overdriveTimer = 480;
            addFloatingText('⚡ OVERDRIVE READY!', player.x, player.y - 30, '#f59e0b');
          } else if (pu.type === 'quad') {
            player.quadDamageTimer = 480;
            addFloatingText('💥 2X DAMAGE ACTIVE!', player.x, player.y - 30, '#c084fc');
          } else if (pu.type === 'rocket') {
            handleSelectWeapon('rocket');
            addFloatingText('🚀 HAVOC ROCKET ARMED', player.x, player.y - 30, '#ef4444');
          }
        }
      });

      // 4. Update Bullets & Collisions
      const survivingBullets: Bullet[] = [];
      stateRef.current.bullets.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        b.traveled += Math.hypot(b.vx, b.vy);

        if (b.x < 10 || b.x > ARENA_WIDTH - 10 || b.y < 10 || b.y > ARENA_HEIGHT - 10 || b.traveled >= b.range) {
          if (b.isRocket) {
            stateRef.current.explosions.push({ x: b.x, y: b.y, radius: 5, maxRadius: 55, color: '#f97316', alpha: 1 });
            triggerScreenShake(7);
          }
          return;
        }

        let hitObstacle = false;
        for (const obs of OBSTACLES) {
          if (b.x > obs.x && b.x < obs.x + obs.w && b.y > obs.y && b.y < obs.y + obs.h) {
            hitObstacle = true;
            break;
          }
        }
        if (hitObstacle) {
          if (b.isRocket) {
            stateRef.current.explosions.push({ x: b.x, y: b.y, radius: 5, maxRadius: 55, color: '#f97316', alpha: 1 });
            triggerScreenShake(7);
          }
          return;
        }

        if (b.ownerId !== player.id && player.hp > 0) {
          const dist = Math.hypot(b.x - player.x, b.y - player.y);
          if (dist < 22) {
            takeDamage(b.damage, b.ownerName, 'Laser');
            return;
          }
        }

        let hitBot = false;
        for (const bot of stateRef.current.bots) {
          if (b.ownerId === bot.id || bot.hp <= 0) continue;

          const dist = Math.hypot(b.x - bot.x, b.y - bot.y);
          if (dist < 22) {
            hitBot = true;

            if (bot.shield > 0) {
              const sDmg = Math.min(bot.shield, b.damage);
              bot.shield -= sDmg;
              b.damage -= sDmg;
            }
            bot.hp -= b.damage;
            addFloatingText(`-${Math.round(b.damage)}`, bot.x, bot.y - 25, bot.color);

            if (bot.hp <= 0) {
              bot.hp = 0;
              bot.deaths += 1;
              addKillEvent(b.ownerName, bot.name, 'Blaster', b.isOwnerBullet, false);

              if (b.ownerId === player.id) {
                player.kills += 1;
                player.score += 250;
                addXp(120);
                addCoins(80);
                soundFx.playVictory();
                confetti({ particleCount: 30, spread: 60, origin: { x: 0.5, y: 0.6 } });
                addFloatingText('+250 PTS', player.x, player.y - 50, '#eab308');
              }
            }
            break;
          }
        }

        if (hitBot) {
          if (b.isRocket) {
            stateRef.current.explosions.push({ x: b.x, y: b.y, radius: 5, maxRadius: 55, color: '#f97316', alpha: 1 });
            triggerScreenShake(7);
          }
          return;
        }

        survivingBullets.push(b);
      });
      stateRef.current.bullets = survivingBullets;

      // 5. Update Explosions
      stateRef.current.explosions.forEach((exp) => {
        exp.radius += 3.5;
        exp.alpha = Math.max(0, 1 - exp.radius / exp.maxRadius);
      });
      stateRef.current.explosions = stateRef.current.explosions.filter((e) => e.alpha > 0);

      // 6. Update Particles
      stateRef.current.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.04;
      });
      stateRef.current.particles = stateRef.current.particles.filter((p) => p.alpha > 0);

      // 7. Update Floating Text
      stateRef.current.floatingTexts.forEach((ft) => {
        ft.y += ft.vy;
        ft.alpha -= 0.025;
      });
      stateRef.current.floatingTexts = stateRef.current.floatingTexts.filter((ft) => ft.alpha > 0);

      // 8. RENDER CANVAS
      ctx.save();

      if (screenShake > 0) {
        const sx = (Math.random() - 0.5) * screenShake;
        const sy = (Math.random() - 0.5) * screenShake;
        ctx.translate(sx, sy);
        setScreenShake((prev) => Math.max(0, prev - 0.6));
      }

      ctx.fillStyle = '#06070a';
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      for (let x = 0; x < ARENA_WIDTH; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ARENA_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < ARENA_HEIGHT; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ARENA_WIDTH, y);
        ctx.stroke();
      }

      ctx.strokeStyle = '#00f0ff44';
      ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, ARENA_WIDTH - 8, ARENA_HEIGHT - 8);

      OBSTACLES.forEach((obs) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeStyle = '#38bdf866';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);

        ctx.fillStyle = '#0284c7';
        ctx.fillRect(obs.x + 8, obs.y + 8, obs.w - 16, 4);
        ctx.fillRect(obs.x + 8, obs.y + obs.h - 12, obs.w - 16, 4);
      });

      stateRef.current.powerups.forEach((pu) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pu.x, pu.y, 22, 0, Math.PI * 2);
        ctx.fillStyle = pu.active ? `${pu.color}22` : '#1e293b22';
        ctx.fill();
        ctx.strokeStyle = pu.active ? pu.color : '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (pu.active) {
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(pu.icon, pu.x, pu.y);
        } else {
          ctx.fillStyle = '#64748b';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${Math.ceil(pu.respawnTime / 1000)}s`, pu.x, pu.y + 3);
        }
        ctx.restore();
      });

      stateRef.current.bullets.forEach((b) => {
        ctx.save();
        ctx.shadowColor = b.color;
        ctx.shadowBlur = b.isRocket ? 14 : 8;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `${b.color}66`;
        ctx.lineWidth = b.radius;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.vx * 1.5, b.y - b.vy * 1.5);
        ctx.stroke();
        ctx.restore();
      });

      stateRef.current.explosions.forEach((exp) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249, 115, 22, ${exp.alpha * 0.4})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(254, 215, 170, ${exp.alpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      });

      stateRef.current.particles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      });

      const renderFighter = (f: Player, isLocal: boolean) => {
        if (f.hp <= 0) return;

        ctx.save();
        ctx.translate(f.x, f.y);

        if (f.isOwner) {
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(234, 179, 8, 0.18)';
          ctx.fill();
          ctx.strokeStyle = '#eab30888';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.rotate(f.angle);
        ctx.fillStyle = f.isOwner ? '#fbbf24' : '#64748b';
        ctx.fillRect(14, -4, 18, 8);

        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.fill();
        ctx.strokeStyle = f.isOwner ? '#fef08a' : (f.isHost ? '#f59e0b' : '#ffffff');
        ctx.lineWidth = f.isOwner ? 3 : 2;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(6, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        ctx.save();
        ctx.translate(f.x, f.y);

        if (f.isOwner) {
          ctx.font = '18px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('👑', 0, -38);
        } else if (f.isHost) {
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#f59e0b';
          ctx.fillText('[HOST]', 0, -36);
        }

        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = f.isOwner ? '#fde047' : (isLocal ? '#38bdf8' : '#f1f5f9');
        ctx.fillText(
          `${f.isOwner ? '[👑 OWNER] ' : ''}${f.name}`,
          0,
          f.isOwner ? -25 : -24
        );

        const barW = 38;
        const barH = 4;
        const hpPercent = f.hp / f.maxHp;
        const shieldPercent = f.shield / f.maxShield;

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-barW / 2, -18, barW, barH);
        ctx.fillStyle = f.isOwner ? '#eab308' : (hpPercent > 0.4 ? '#10b981' : '#ef4444');
        ctx.fillRect(-barW / 2, -18, barW * hpPercent, barH);

        if (f.shield > 0) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-barW / 2, -13, barW, 2.5);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-barW / 2, -13, barW * shieldPercent, 2.5);
        }

        if (f.chatMsg && f.chatMsg.timer > 0) {
          ctx.font = '11px sans-serif';
          const textW = ctx.measureText(f.chatMsg.text).width;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(-textW / 2 - 8, -60, textW + 16, 20, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(f.chatMsg.text, 0, -46);
        }

        ctx.restore();
      };

      stateRef.current.bots.forEach((b) => renderFighter(b, false));
      stateRef.current.remotePlayers.forEach((rp) => renderFighter(rp, false));
      renderFighter(player, true);

      stateRef.current.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      if (player.hp > 0) {
        ctx.save();
        ctx.strokeStyle = player.isOwner ? 'rgba(234, 179, 8, 0.3)' : 'rgba(0, 240, 255, 0.25)';
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.x + Math.cos(player.angle) * 300, player.y + Math.sin(player.angle) * 300);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [viewState, currentRoom, userProfile, addXp, addCoins]);

  // ================= RENDER SCREEN: VIEW 1 - ROOMS BROWSER & NAME SETUP =================
  if (viewState === 'rooms') {
    return (
      <div className="w-full flex flex-col gap-8 max-w-5xl mx-auto py-4">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setCurrentPage('home');
              soundFx.playClick();
            }}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" /> Back to Home
          </button>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-wider">
              <Swords className="w-4 h-4 text-cyan-400 animate-pulse" /> 100% ORIGINAL MULTIPLAYER
            </span>
          </div>
        </div>

        {/* Invited banner notification if user came from a share link */}
        {detectedInviteCode && (
          <div className="bg-gradient-to-r from-purple-900/60 via-slate-900 to-cyan-950/60 border-2 border-cyan-400/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-cyan-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-lg">
                🎉
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Room Invitation Detected!</h4>
                <p className="text-xs text-slate-300">
                  You've been invited to join Room <strong className="text-cyan-400 font-mono">{detectedInviteCode}</strong>. Confirm your name below and jump straight in!
                </p>
              </div>
            </div>
            <button
              onClick={() => handleJoinRoom(detectedInviteCode)}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shrink-0 shadow-lg"
            >
              Join Invited Room
            </button>
          </div>
        )}

        {/* MANDATORY STEP: Gamer Name Setup Card */}
        <div className="bg-slate-900/90 border border-cyan-500/40 rounded-3xl p-6 backdrop-blur shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-xl shrink-0 ${
                  userProfile.isOwner ? 'ring-4 ring-amber-400 shadow-amber-500/40' : 'border border-cyan-500/50'
                }`}
                style={{ backgroundColor: userProfile.avatar.color || '#00f0ff' }}
              >
                {userProfile.avatar.badge}
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" /> Step 1: Your Gamer Identity
                </span>
                <h3 className="text-lg font-black text-white">
                  Write Your Name Before Joining or Hosting
                </h3>
                <p className="text-xs text-slate-400">
                  Everyone in the room will see this name. {userProfile.isOwner && '👑 Owner status enabled!'}
                </p>
              </div>
            </div>

            {/* Name Input Field */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={playerNameInput}
                onChange={(e) => {
                  setPlayerNameInput(e.target.value);
                  setNameError('');
                }}
                placeholder="Enter your name..."
                className="bg-slate-950 border border-slate-700 focus:border-cyan-400 text-sm font-bold text-white px-4 py-3 rounded-xl outline-none transition w-full sm:w-64"
              />
              <button
                onClick={() => validateAndSaveName() && soundFx.playClick()}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-extrabold text-xs px-4 py-3 rounded-xl border border-slate-700 transition cursor-pointer"
              >
                Save Name
              </button>
            </div>
          </div>

          {nameError && (
            <div className="mt-3 text-xs font-bold text-rose-400 bg-rose-950/40 border border-rose-800 px-3 py-1.5 rounded-xl">
              {nameError}
            </div>
          )}
        </div>

        {/* Room Action Grids: Host a Room or Join with Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option A: Host a Room */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
              <Crown className="w-5 h-5 text-amber-400" /> Host a New Room
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create a custom match room where you are the <strong className="text-amber-300">👑 HOST</strong>. You control when the match begins, can invite friends via link, and configure room settings.
            </p>

            <form onSubmit={handleHostRoom} className="flex flex-col gap-3 mt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Room Title</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. Cyber Arena Skirmish"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white rounded-xl px-3.5 py-2.5 outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Max Players</label>
                <div className="grid grid-cols-4 gap-2">
                  {[4, 6, 8, 10].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setMaxPlayersChoice(num)}
                      className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        maxPlayersChoice === num
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {num} Players
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-amber-500/20 transition transform hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4 fill-slate-950" /> CREATE & HOST ROOM
              </button>
            </form>
          </div>

          {/* Option B: Join Room by Code */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
              <Zap className="w-5 h-5 text-cyan-400" /> Join Room by Code
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Have a room code sent by a friend or host? Enter the room code below to join their lobby immediately.
            </p>

            <div className="flex flex-col gap-3 mt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Enter 6-Digit Room Code</label>
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. ALPHA-7"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 font-mono text-sm uppercase font-bold text-cyan-400 rounded-xl px-3.5 py-2.5 outline-none transition"
                />
              </div>

              <button
                onClick={() => joinCodeInput.trim() && handleJoinRoom(joinCodeInput.trim())}
                disabled={!joinCodeInput.trim()}
                className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition transform hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" /> JOIN ROOM NOW
              </button>
            </div>
          </div>
        </div>

        {/* Public Live Rooms Roster */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Users className="w-4 h-4 text-purple-400" /> Live Public Rooms ({publicRooms.length})
            </h3>
            <span className="text-xs text-slate-400">Click any room to join as a player</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicRooms.map((room) => (
              <div
                key={room.code}
                className="bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 flex items-center justify-between transition"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{room.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
                      {room.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-amber-300 font-semibold">
                      <Crown className="w-3 h-3 text-amber-400" /> Host: {room.hostName}
                    </span>
                    <span>•</span>
                    <span>{room.players.length}/{room.maxPlayers} Players</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyInviteLink(room.code)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition"
                    title="Copy Invite Link"
                  >
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                  <button
                    onClick={() => handleJoinRoom(room.code)}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Join Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER SCREEN: VIEW 2 - PRE-GAME ROOM LOBBY =================
  if (viewState === 'lobby' && currentRoom) {
    const isHost = currentRoom.hostId === playerNameInput.trim() || currentRoom.hostName === playerNameInput.trim();

    return (
      <div className="w-full flex flex-col gap-6 max-w-5xl mx-auto py-4">
        {/* Lobby Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 font-bold text-xl shadow-lg shadow-amber-500/20">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">{currentRoom.name}</h2>
                <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-400 px-2.5 py-0.5 rounded-lg border border-cyan-800">
                  CODE: {currentRoom.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Host: <strong className="text-amber-300">{currentRoom.hostName}</strong> {isHost && '(YOU)'}
              </p>
            </div>
          </div>

          {/* Copy Invite Link & Leave */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleCopyInviteLink(currentRoom.code)}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-400/60 text-cyan-300 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{copiedLink ? 'Invite Link Copied!' : 'Copy Invite Link'}</span>
            </button>

            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-xs font-bold px-3 py-2.5 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Leave
            </button>
          </div>
        </div>

        {/* Players Roster in Lobby */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" /> Room Fighters ({currentRoom.players.length}/{currentRoom.maxPlayers})
              </h3>
              {isHost && (
                <button
                  onClick={handleAddBotToLobby}
                  className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
                >
                  + Add Bot Opponent
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentRoom.players.map((p) => (
                <div
                  key={p.id}
                  className={`border rounded-2xl p-3.5 flex items-center justify-between ${
                    p.name === playerNameInput.trim()
                      ? 'bg-cyan-950/40 border-cyan-500/60'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow"
                      style={{ backgroundColor: p.color || '#00f0ff' }}
                    >
                      {p.badge || '⚡'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {p.isHost && (
                          <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded font-mono">
                            HOST
                          </span>
                        )}
                        {p.isBot && (
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded font-mono">
                            BOT
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Level {p.level || 1}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    READY
                  </span>
                </div>
              ))}
            </div>

            {/* Launch Action Button */}
            <div className="border-t border-slate-800 pt-4 mt-2">
              {isHost ? (
                <button
                  onClick={handleHostStartMatch}
                  className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition transform hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-slate-950" /> START ARENA MATCH (FOR ALL PLAYERS)
                </button>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Waiting for host <strong className="text-amber-300">{currentRoom.hostName}</strong> to start the match...</span>
                </div>
              )}
            </div>
          </div>

          {/* Lobby Live Chat */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 backdrop-blur shadow-xl flex flex-col justify-between h-96">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-white mb-3">
                <MessageSquare className="w-4 h-4 text-purple-400" /> Lobby Chat
              </div>
              <div className="max-h-64 overflow-y-auto flex flex-col gap-2 text-xs pr-1">
                {chatLog.map((m, idx) => (
                  <div key={idx} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed">
                    <span className={m.isHost ? 'text-amber-300 font-bold' : 'text-cyan-400 font-bold'}>
                      {m.isHost && '👑 '}{m.sender}:
                    </span>{' '}
                    <span className="text-slate-200">{m.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendChat} className="flex items-center gap-2 mt-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Chat with lobby..."
                className="flex-1 bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="p-2.5 bg-cyan-500 text-slate-950 font-bold rounded-xl cursor-pointer hover:bg-cyan-400"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER SCREEN: VIEW 3 - LIVE MULTIPLAYER MATCH =================
  return (
    <div className="w-full flex flex-col gap-6 max-w-6xl mx-auto py-2">
      {/* Top Navigation & Lobby Info Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 backdrop-blur shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewState('lobby')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" /> Room Lobby
          </button>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wider shadow-sm">
              <Swords className="w-4 h-4 text-cyan-400 animate-pulse" /> 100% ORIGINAL GAME
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-1 rounded-xl">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> {ping}ms Sync
            </span>
          </div>
        </div>

        {/* Room Code & Quick Invite */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-300 font-medium">Room:</span>
            <span className="text-xs font-mono font-bold text-cyan-400">{currentRoom?.code || 'CYBER-ARENA-1'}</span>
            <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              Host: {currentRoom?.hostName || 'You'}
            </span>
          </div>

          <button
            onClick={() => handleCopyInviteLink(currentRoom?.code)}
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black px-3 py-2 rounded-xl transition cursor-pointer shadow-md"
            title="Share Room Invite Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5 text-slate-950" />}
            <span>{copiedLink ? 'Copied Link!' : 'Copy Invite Link'}</span>
          </button>

          <button
            onClick={toggleMute}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Game Screen with Active Canvas */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex flex-col items-center">
        {/* Glow ambient background aura */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-600/20 to-pink-500/20 rounded-3xl blur-xl pointer-events-none" />

        {/* Live HUD Header Overlay */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between pointer-events-none">
          {/* Player Vitals HUD */}
          <div className="flex flex-col gap-2 bg-slate-950/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-850 shadow-xl pointer-events-auto min-w-[200px]">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className={userProfile.isOwner ? 'text-amber-300 font-black flex items-center gap-1' : 'text-cyan-400'}>
                {userProfile.isOwner && '👑'} {stateRef.current.localPlayer.name}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                K/D: {stateRef.current.localPlayer.kills}/{stateRef.current.localPlayer.deaths}
              </span>
            </div>

            {/* Health Bar */}
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-200 ${
                  userProfile.isOwner
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                }`}
                style={{ width: `${Math.max(0, (stateRef.current.localPlayer.hp / 100) * 100)}%` }}
              />
            </div>

            {/* Shield Bar */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200"
                style={{ width: `${Math.max(0, (stateRef.current.localPlayer.shield / 100) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>HP: {Math.max(0, Math.round(stateRef.current.localPlayer.hp))}</span>
              <span>SHIELD: {Math.round(stateRef.current.localPlayer.shield)}</span>
            </div>
          </div>

          {/* Killfeed Banner */}
          <div className="flex flex-col gap-1.5 max-w-xs items-end pointer-events-none">
            {killFeed.map((kf) => (
              <div
                key={kf.id}
                className="bg-slate-950/80 backdrop-blur border border-slate-800 text-[11px] px-3 py-1 rounded-xl shadow-lg flex items-center gap-1.5 animate-fade-in"
              >
                <span className={kf.isKillerOwner ? 'text-amber-400 font-bold' : 'text-cyan-400 font-semibold'}>
                  {kf.isKillerOwner && '👑 '} {kf.killer}
                </span>
                <span className="text-slate-500 text-[9px] uppercase font-mono px-1 bg-slate-900 rounded">
                  {kf.weapon}
                </span>
                <span className={kf.isVictimOwner ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                  {kf.isVictimOwner && '👑 '} {kf.victim}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Canvas Viewport */}
        <canvas
          ref={canvasRef}
          width={ARENA_WIDTH}
          height={ARENA_HEIGHT}
          className="w-full aspect-[12/7] max-h-[640px] object-contain cursor-crosshair relative z-10"
        />

        {/* Weapon Selection Deck Bar */}
        <div className="w-full bg-slate-900/95 border-t border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 hidden sm:inline">Loadout:</span>
            {(['rifle', 'shotgun', 'railgun', 'rocket'] as const).map((w, idx) => {
              const wp = WEAPONS[w];
              const isSelected = selectedWeapon === w;
              return (
                <button
                  key={w}
                  onClick={() => handleSelectWeapon(w)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-1 rounded">{idx + 1}</span>
                  <span>{wp.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={startReload}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reload [R]</span>
            </button>

            <button
              onClick={() => setChatOpen((prev) => !prev)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              <span>Chat [Enter]</span>
            </button>

            <button
              onClick={() => setScoreboardOpen((prev) => !prev)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Scoreboard [Tab]</span>
            </button>
          </div>
        </div>

        {/* In-Game Chat Box Modal Overlay */}
        {chatOpen && (
          <div className="absolute bottom-16 left-4 z-30 w-80 bg-slate-950/95 border border-slate-800 rounded-2xl p-3 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Arena Live Chat
              </span>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>
            <div className="max-h-36 overflow-y-auto flex flex-col gap-1 text-[11px] mb-2 pr-1">
              {chatLog.slice(-6).map((msg, i) => (
                <div key={i} className="leading-tight">
                  <span className={msg.isOwner ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
                    {msg.sender}:
                  </span>{' '}
                  <span className="text-slate-200">{msg.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type message to arena..."
                className="flex-1 bg-slate-900 border border-slate-800 text-xs text-white px-2.5 py-1.5 rounded-xl outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="p-2 bg-cyan-500 text-slate-950 rounded-xl font-bold cursor-pointer hover:bg-cyan-400"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Scoreboard Modal Overlay */}
        {scoreboardOpen && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex items-center justify-center p-6">
            <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Live Match Scoreboard</h3>
                </div>
                <button
                  onClick={() => setScoreboardOpen(false)}
                  className="text-slate-400 hover:text-white text-xs bg-slate-800 px-3 py-1 rounded-lg cursor-pointer"
                >
                  Close [Tab]
                </button>
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <div className="grid grid-cols-12 text-slate-400 font-bold px-3 py-1 uppercase text-[10px] tracking-wider">
                  <div className="col-span-1">#</div>
                  <div className="col-span-6">Fighter</div>
                  <div className="col-span-2 text-center">K / D</div>
                  <div className="col-span-3 text-right">Score</div>
                </div>

                {[stateRef.current.localPlayer, ...stateRef.current.bots]
                  .sort((a, b) => b.score - a.score)
                  .map((fighter, rank) => (
                    <div
                      key={fighter.id}
                      className={`grid grid-cols-12 items-center px-3 py-2 rounded-xl ${
                        fighter.id === stateRef.current.localPlayer.id
                          ? 'bg-cyan-950/40 border border-cyan-500/40 font-bold'
                          : 'bg-slate-950/50'
                      }`}
                    >
                      <div className="col-span-1 font-mono text-slate-400">
                        {rank === 0 ? '👑' : rank + 1}
                      </div>
                      <div className="col-span-6 flex items-center gap-2 truncate">
                        <span className="text-sm">{fighter.badge}</span>
                        <span className={fighter.isOwner ? 'text-amber-300 font-black' : (fighter.id === stateRef.current.localPlayer.id ? 'text-cyan-300' : 'text-slate-200')}>
                          {fighter.name} {fighter.id === stateRef.current.localPlayer.id && '(YOU)'}
                        </span>
                      </div>
                      <div className="col-span-2 text-center font-mono text-slate-300">
                        {fighter.kills} / {fighter.deaths}
                      </div>
                      <div className="col-span-3 text-right font-mono font-bold text-amber-400">
                        {fighter.score.toLocaleString()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
