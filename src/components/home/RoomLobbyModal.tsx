import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useMultiplayer } from '../../context/MultiplayerContext';
import { soundFx } from '../../utils/audio';
import { GAMES_LIST } from '../../data/gamesList';
import type { GameId } from '../../types/game';
import { X, Users, Play, Send, Globe, MessageSquare } from 'lucide-react';

export const RoomLobbyModal: React.FC = () => {
  const { isRoomLobbyOpen, setIsRoomLobbyOpen, setActiveGameId, userProfile } = useGame();
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

  if (!isRoomLobbyOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRoom(selectedGameId, roomNameInput || `${userProfile.username}'s Arena`, false, 4);
    setActiveTab('browse');
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCodeInput.trim()) {
      joinRoom(joinCodeInput.trim());
      setJoinCodeInput('');
    }
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
              <h2 className="text-lg font-bold text-white tracking-wide">Multiplayer Lobbies & Matchmaking</h2>
              <p className="text-xs text-slate-400">Join online gaming rooms or create your own custom arena</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsRoomLobbyOpen(false);
              soundFx.playClick();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Active Room View if Joined */}
          {currentRoom ? (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Room Details & Players List */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">{currentRoom.name}</span>
                      <span className="text-xs font-mono bg-cyan-900/60 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                        CODE: {currentRoom.code}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Game: {GAMES_LIST.find((g) => g.id === currentRoom.gameId)?.title}
                    </span>
                  </div>

                  <button
                    onClick={leaveRoom}
                    className="text-xs text-rose-400 hover:text-rose-300 bg-rose-950/60 border border-rose-800 px-3 py-1.5 rounded-lg transition"
                  >
                    Leave Room
                  </button>
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
                              {player.username}
                              {player.isHost && (
                                <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded">
                                  HOST
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

                {/* Ready / Start Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleReady}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold py-3 rounded-xl transition"
                  >
                    TOGGLE READY STATUS
                  </button>

                  <button
                    onClick={handleStartGame}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition transform hover:scale-102 flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-white" /> START ARENA MATCH
                  </button>
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
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold p-2 rounded-xl"
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
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                      activeTab === 'browse'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Browse Public Lobbies
                  </button>
                  <button
                    onClick={() => setActiveTab('create')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                      activeTab === 'create'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Create Custom Room
                  </button>
                </div>

                {/* Direct Room Code Input */}
                <form onSubmit={handleJoinByCode} className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    placeholder="Enter Room Code..."
                    className="bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 px-3 py-2 rounded-xl outline-none focus:border-cyan-500 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition whitespace-nowrap"
                  >
                    JOIN
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
                            Game: {GAMES_LIST.find((g) => g.id === room.gameId)?.title}
                          </p>
                        </div>
                        <span className="text-xs font-mono bg-slate-950 text-slate-300 px-2 py-1 rounded border border-slate-800">
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
                        <button
                          onClick={() => joinRoom(room.id)}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition"
                        >
                          JOIN LOBBY
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Create Room Form */
                <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-xl mx-auto w-full">
                  <h3 className="text-base font-bold text-white mb-2">Configure New Room</h3>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Room Name</label>
                    <input
                      type="text"
                      value={roomNameInput}
                      onChange={(e) => setRoomNameInput(e.target.value)}
                      placeholder={`${userProfile.username}'s Cyber Arena`}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-4 py-2.5 rounded-xl outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Select Game</label>
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
                    className="w-full bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:opacity-90 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg mt-4 transition"
                  >
                    CREATE & OPEN LOBBY
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
