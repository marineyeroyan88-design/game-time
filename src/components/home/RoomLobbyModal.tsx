import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useMultiplayer } from '../../context/MultiplayerContext';
import { soundFx } from '../../utils/audio';
import { GAMES_LIST } from '../../data/gamesList';
import type { GameId } from '../../types/game';
import {
  X,
  Users,
  Play,
  Send,
  Globe,
  MessageSquare,
  Copy,
  Check,
  Share2,
  Crown,
  UserCheck,
  Swords
} from 'lucide-react';

export const RoomLobbyModal: React.FC = () => {
  const {
    isRoomLobbyOpen,
    setIsRoomLobbyOpen,
    setActiveGameId,
    userProfile,
    updateProfile,
    setCurrentPage
  } = useGame();

  const {
    currentRoom,
    publicRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    sendChatMessage,
    startGameSession,
  } = useMultiplayer();

  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  const [roomNameInput, setRoomNameInput] = useState('');
  const [selectedGameId, setSelectedGameId] = useState<GameId>('neon-strike');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [chatInput, setChatInput] = useState('');

  // Mandatory name input before joining or hosting
  const [playerNameInput, setPlayerNameInput] = useState(userProfile.username || '');
  const [nameError, setNameError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isRoomLobbyOpen) return null;

  // Validate Name
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
    return true;
  };

  const getInviteUrl = (code: string) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?room=${code}`;
  };

  const handleCopyInviteLink = (code: string) => {
    const link = getInviteUrl(code);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    soundFx.playClick();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    soundFx.playClick();
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAndSaveName()) return;

    createRoom(selectedGameId, roomNameInput || `${playerNameInput.trim()}'s Arena`, false, 4);
    setActiveTab('browse');
    soundFx.playVictory();
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAndSaveName()) return;

    if (joinCodeInput.trim()) {
      joinRoom(joinCodeInput.trim());
      setJoinCodeInput('');
      soundFx.playClick();
    }
  };

  const handleJoinRoomDirect = (targetCodeOrId: string) => {
    if (!validateAndSaveName()) return;
    joinRoom(targetCodeOrId);
    soundFx.playClick();
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendChatMessage(chatInput.trim());
      setChatInput('');
      soundFx.playClick();
    }
  };

  const handleStartGame = () => {
    if (!currentRoom) return;
    startGameSession();
    setActiveGameId(currentRoom.gameId);
    setIsRoomLobbyOpen(false);
    soundFx.playVictory();
  };

  const isUserHost = Boolean(
    currentRoom &&
      (currentRoom.hostId === userProfile.username ||
        currentRoom.players.some((p) => p.username === userProfile.username && p.isHost))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Multiplayer Lobbies & Rooms</h2>
              <p className="text-xs text-slate-400">Host, join by room code, or share an invite link with friends</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsRoomLobbyOpen(false);
                setCurrentPage('original-game');
                soundFx.playClick();
              }}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition"
            >
              <Swords className="w-3.5 h-3.5 text-cyan-400" /> Original Game Arena
            </button>
            <button
              onClick={() => {
                setIsRoomLobbyOpen(false);
                soundFx.playClick();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Name Registration Card (Mandatory before joining or hosting) */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white">Your Gamer Name:</span>
              <span className="text-[11px] text-slate-400 ml-1.5">
                (Visible to all room players and hosts)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={playerNameInput}
              onChange={(e) => {
                setPlayerNameInput(e.target.value);
                setNameError('');
              }}
              placeholder="Enter your name..."
              className="bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs font-bold text-white px-3 py-2 rounded-xl outline-none w-full sm:w-56"
            />
            <button
              onClick={() => validateAndSaveName() && soundFx.playClick()}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs px-3 py-2 rounded-xl border border-slate-700 whitespace-nowrap cursor-pointer"
            >
              Confirm Name
            </button>
          </div>
        </div>

        {nameError && (
          <div className="bg-rose-950/70 border-b border-rose-800 px-6 py-2 text-xs font-bold text-rose-300">
            {nameError}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Active Room View if Joined */}
          {currentRoom ? (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Room Details & Players List */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-white">{currentRoom.name}</span>
                      <div className="flex items-center gap-1 bg-cyan-950/80 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/40 font-mono text-xs font-bold">
                        <span>CODE: {currentRoom.code}</span>
                        <button
                          onClick={() => handleCopyCode(currentRoom.code)}
                          className="hover:text-white transition ml-1"
                          title="Copy Code"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">
                      Game: {GAMES_LIST.find((g) => g.id === currentRoom.gameId)?.title || 'Cyber Arena'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Copy Inviting Link */}
                    <button
                      onClick={() => handleCopyInviteLink(currentRoom.code)}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 text-cyan-300 border border-cyan-400/50 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
                    </button>

                    <button
                      onClick={leaveRoom}
                      className="text-xs text-rose-400 hover:text-rose-300 bg-rose-950/60 border border-rose-800 px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      Leave Room
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Lobby Players ({currentRoom.players.length}/{currentRoom.maxPlayers})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentRoom.players.map((player) => (
                      <div
                        key={player.id}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow"
                            style={{ backgroundColor: player.avatar.color || '#00f0ff' }}
                          >
                            {player.avatar.badge}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                              <span>{player.username}</span>
                              {player.isHost && (
                                <span className="flex items-center gap-0.5 text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded font-mono">
                                  <Crown className="w-2.5 h-2.5" /> HOST
                                </span>
                              )}
                              {player.isBot && (
                                <span className="text-[9px] bg-purple-900/80 text-purple-300 px-1.5 py-0.2 rounded font-mono">
                                  BOT AI
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            player.isReady
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {player.isReady ? 'READY' : 'NOT READY'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ready / Start Actions - Host Controlled */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={toggleReady}
                    className="w-full sm:w-auto flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold py-3 rounded-xl transition cursor-pointer text-xs"
                  >
                    TOGGLE READY STATUS
                  </button>

                  {isUserHost ? (
                    <button
                      onClick={handleStartGame}
                      className="w-full sm:w-auto flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition transform hover:scale-102 flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      <Play className="w-4 h-4 fill-slate-950" /> START ARENA MATCH (HOST)
                    </button>
                  ) : (
                    <div className="w-full sm:w-auto flex-1 bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>Waiting for room host to start...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Room Live Chat Box */}
              <div className="w-full lg:w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-80 lg:h-auto">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-cyan-400" /> Lobby Chat
                </h3>

                <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 mb-3">
                  {currentRoom.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`text-xs p-2 rounded-lg ${
                        m.isSystem ? 'bg-slate-800/80 text-cyan-300 italic' : 'bg-slate-950 text-slate-200'
                      }`}
                    >
                      {!m.isSystem && (
                        <span className="font-bold text-purple-400 mr-1.5">
                          {m.senderBadge} {m.senderName}:
                        </span>
                      )}
                      <span>{m.text}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1 bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold p-2 rounded-xl cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Lobby Browse & Create Tabs */
            <div className="flex flex-col gap-6">
              {/* Navigation Tabs & Join Code Input */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab('browse')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      activeTab === 'browse'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Browse Public Lobbies
                  </button>
                  <button
                    onClick={() => setActiveTab('create')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      activeTab === 'create'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Host New Room
                  </button>
                </div>

                {/* Direct Room Code Input */}
                <form onSubmit={handleJoinByCode} className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter Room Code..."
                    className="bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 px-3 py-2 rounded-xl outline-none focus:border-cyan-500 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition whitespace-nowrap cursor-pointer"
                  >
                    JOIN ROOM
                  </button>
                </form>
              </div>

              {activeTab === 'browse' ? (
                /* Public Lobbies List */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {publicRooms.map((room) => (
                    <div
                      key={room.id}
                      className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 flex flex-col justify-between gap-4 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Globe className="w-4 h-4 text-cyan-400" /> {room.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            Game: {GAMES_LIST.find((g) => g.id === room.gameId)?.title || 'Cyber Arena'}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold bg-slate-950 text-cyan-400 px-2 py-1 rounded border border-slate-800">
                          {room.code}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span>
                            {room.players.length}/{room.maxPlayers} Players
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyInviteLink(room.code)}
                            className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition"
                            title="Copy Invite Link"
                          >
                            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                          </button>
                          <button
                            onClick={() => handleJoinRoomDirect(room.id)}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                          >
                            JOIN LOBBY
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Create Room Form */
                <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-xl mx-auto w-full">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Crown className="w-4 h-4" /> Host a Custom Room
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Room Title</label>
                    <input
                      type="text"
                      value={roomNameInput}
                      onChange={(e) => setRoomNameInput(e.target.value)}
                      placeholder={`${playerNameInput.trim() || userProfile.username}'s Arena`}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-4 py-2.5 rounded-xl outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Select Game Arena</label>
                    <select
                      value={selectedGameId}
                      onChange={(e) => setSelectedGameId(e.target.value as GameId)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-4 py-2.5 rounded-xl outline-none focus:border-cyan-500"
                    >
                      {GAMES_LIST.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title} ({g.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:opacity-90 text-slate-950 font-extrabold text-xs py-3 rounded-xl shadow-lg mt-4 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4 fill-slate-950" /> CREATE & BECOME HOST
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
