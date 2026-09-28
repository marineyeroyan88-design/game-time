import React from 'react';
import { useGame } from '../../context/GameContext';
import { GAMES_LIST } from '../../data/gamesList';
import { soundFx } from '../../utils/audio';
import { NeonStrikeGame } from '../games/NeonStrikeGame';
import { SlitherArenaGame } from '../games/SlitherArenaGame';
import { PixelDashGame } from '../games/PixelDashGame';
import { CyberHockeyGame } from '../games/CyberHockeyGame';
import { BlockRushGame } from '../games/BlockRushGame';
import { Cs1Game } from '../games/Cs1Game';
import { CarDestructionGame } from '../games/CarDestructionGame';
import { SandboxUniverseGame } from '../games/SandboxUniverseGame';
import { RedBlueLeaderGame } from '../games/RedBlueLeaderGame';
import { ArrowLeft, Maximize2, Star, Volume2, VolumeX } from 'lucide-react';

export const GameContainer: React.FC = () => {
  const { activeGameId, setActiveGameId, isMuted, toggleMute } = useGame();

  const gameInfo = GAMES_LIST.find((g) => g.id === activeGameId);

  // Ensure website background music is turned off during gameplay
  React.useEffect(() => {
    soundFx.stopBgm();
    return () => {
      soundFx.stopBgm();
    };
  }, [activeGameId]);

  if (!activeGameId) return null;

  const handleBackToPortal = () => {
    setActiveGameId(null);
    soundFx.playClick();
  };

  const handleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Determine game engine component to render
  const renderGameEngine = () => {
    if (gameInfo?.iframeUrl) {
      return (
        <div className="w-full aspect-[16/9] min-h-[500px] bg-slate-950 flex items-center justify-center">
          <iframe
            src={gameInfo.iframeUrl}
            title={gameInfo.title}
            className="w-full h-full border-0 rounded-2xl"
            allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          />
        </div>
      );
    }

    switch (activeGameId) {
      case 'neon-strike':
        return <NeonStrikeGame />;
      case 'slither-arena':
        return <SlitherArenaGame />;
      case 'pixel-dash':
        return <PixelDashGame />;
      case 'cyber-hockey':
        return <CyberHockeyGame />;
      case 'block-rush':
        return <BlockRushGame />;

      case 'cs-1':
      case 'call-of-battle':
      case 'fortzone-battle-royale':
        return <Cs1Game />;

      case 'car-destruction-3d':
      case 'police-chase-cops':
      case 'city-rush-driving':
      case 'car-crash-sandbox':
      case 'bus-simulator-evo':
      case 'truck-simulator-euro':
      case 'driving-school-sim':
        return <CarDestructionGame />;

      case 'sandbox-universe':
      case 'planet-destroyer':
      case 'business-jet-sim':
      case 'gamers-mod':
      case 'prison-pump':
        return <SandboxUniverseGame />;

      case 'red-blue-leader-2':
      default:
        return <RedBlueLeaderGame />;
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
      {/* Top Header Controls */}
      <div className="w-full max-w-5xl flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-4 backdrop-blur shadow-xl">
        <button
          onClick={handleBackToPortal}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </button>

        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-white tracking-wide hidden sm:block">
            {gameInfo?.title}
          </h2>
          <span className="text-xs bg-cyan-950 text-cyan-400 font-bold px-2.5 py-1 rounded-full border border-cyan-800">
            {gameInfo?.category}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Playable Canvas Viewport with Ambient Glow */}
      <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 rounded-2xl blur-lg opacity-40 animate-pulse" />
        <div className="relative z-10 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
          {renderGameEngine()}
        </div>
      </div>

      {/* Game Description & Controls Info Panel */}
      {gameInfo && (
        <div className="w-full max-w-5xl bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>{gameInfo.title} Overview</span>
              <span className="flex items-center gap-1 text-xs text-yellow-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                <Star className="w-3 h-3 fill-yellow-400" /> {gameInfo.rating}
              </span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">{gameInfo.description}</p>
          </div>

          <div className="w-full md:w-80 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Control Bindings</h4>
            <div className="flex flex-col gap-1.5 text-xs">
              {gameInfo.controls.map((ctrl, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-900 pb-1">
                  <span className="font-mono text-purple-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                    {ctrl.key}
                  </span>
                  <span className="text-slate-400 text-[11px]">{ctrl.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
