import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { Trophy, RefreshCw, Zap } from 'lucide-react';

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'laser' | 'spikes' | 'drone';
}

export const PixelDashGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { recordHighScore, addXp, addCoins } = useGame();

  const [distance, setDistance] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const runnerStateRef = useRef({
    x: 100,
    y: 360,
    vy: 0,
    width: 24,
    height: 36,
    isGrounded: true,
    jumpCount: 0,
    speed: 6,
    coins: 0,
    dist: 0,
    platforms: [] as Platform[],
    obstacles: [] as Obstacle[],
    coinsList: [] as { x: number; y: number; collected: boolean }[],
  });

  useEffect(() => {
    const initLevel = () => {
      const initialPlatforms: Platform[] = [
        { x: 0, y: 420, width: 600, height: 120 },
        { x: 680, y: 390, width: 400, height: 150 },
        { x: 1140, y: 360, width: 500, height: 180 },
      ];
      runnerStateRef.current.platforms = initialPlatforms;
      runnerStateRef.current.dist = 0;
      runnerStateRef.current.coins = 0;
      runnerStateRef.current.speed = 6;
      runnerStateRef.current.y = 360;
      runnerStateRef.current.vy = 0;
    };

    initLevel();

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === ' ' || k === 'arrowup' || k === 'w') {
        const state = runnerStateRef.current;
        if (state.jumpCount < 2) {
          state.vy = -12;
          state.isGrounded = false;
          state.jumpCount++;
          soundFx.playShoot();
        }
      }
      if (k === 'arrowdown' || k === 's') {
        runnerStateRef.current.vy += 8; // Fast fall
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const state = runnerStateRef.current;

      if (!gameOver) {
        // Gravity & Velocity
        state.vy += 0.65;
        state.y += state.vy;
        state.dist += Math.floor(state.speed / 2);
        setDistance(state.dist);

        // Gradually increase speed
        state.speed = Math.min(13, 6 + state.dist / 1000);

        // Platform Collisions
        state.isGrounded = false;
        state.platforms.forEach((p) => {
          p.x -= state.speed;

          // Check landing on top
          if (
            state.x + state.width > p.x &&
            state.x < p.x + p.width &&
            state.y + state.height >= p.y &&
            state.y + state.height <= p.y + 16 &&
            state.vy >= 0
          ) {
            state.y = p.y - state.height;
            state.vy = 0;
            state.isGrounded = true;
            state.jumpCount = 0;
          }
        });

        // Spawn procedurally new platforms
        const lastPlatform = state.platforms[state.platforms.length - 1];
        if (lastPlatform && lastPlatform.x + lastPlatform.width < canvas.width + 400) {
          const gap = 80 + Math.random() * 120;
          const nextWidth = 300 + Math.random() * 400;
          const nextY = 320 + Math.random() * 100;

          state.platforms.push({
            x: lastPlatform.x + lastPlatform.width + gap,
            y: nextY,
            width: nextWidth,
            height: 180,
          });

          // Spawn obstacle on new platform
          if (Math.random() < 0.6) {
            state.obstacles.push({
              x: lastPlatform.x + lastPlatform.width + gap + nextWidth / 2,
              y: nextY - 24,
              width: 24,
              height: 24,
              type: Math.random() < 0.5 ? 'spikes' : 'laser',
            });
          }

          // Spawn coin trail
          for (let c = 0; c < 3; c++) {
            state.coinsList.push({
              x: lastPlatform.x + lastPlatform.width + gap + 40 + c * 35,
              y: nextY - 50,
              collected: false,
            });
          }
        }

        // Clean off-screen platforms
        if (state.platforms[0] && state.platforms[0].x + state.platforms[0].width < -200) {
          state.platforms.shift();
        }

        // Update Obstacles
        for (let i = state.obstacles.length - 1; i >= 0; i--) {
          const obs = state.obstacles[i];
          obs.x -= state.speed;

          if (
            state.x + state.width > obs.x &&
            state.x < obs.x + obs.width &&
            state.y + state.height > obs.y &&
            state.y < obs.y + obs.height
          ) {
            setGameOver(true);
            soundFx.playDefeat();
            recordHighScore('pixel-dash', state.dist);
            addXp(Math.floor(state.dist / 10));
            addCoins(state.coins);
          }

          if (obs.x < -100) state.obstacles.splice(i, 1);
        }

        // Update Coins
        for (let i = state.coinsList.length - 1; i >= 0; i--) {
          const coin = state.coinsList[i];
          coin.x -= state.speed;

          if (!coin.collected && Math.hypot(coin.x - state.x, coin.y - state.y) < 30) {
            coin.collected = true;
            state.coins += 10;
            setCoinsCollected(state.coins);
            soundFx.playCoin();
          }

          if (coin.x < -100) state.coinsList.splice(i, 1);
        }

        // Fall into void check
        if (state.y > canvas.height + 50) {
          setGameOver(true);
          soundFx.playDefeat();
          recordHighScore('pixel-dash', state.dist);
          addXp(Math.floor(state.dist / 10));
          addCoins(state.coins);
        }
      }

      // --- CANVAS DRAWING ---
      ctx.fillStyle = '#0a0914';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Synthwave Sun Background
      const grad = ctx.createLinearGradient(0, 100, 0, 300);
      grad.addColorStop(0, '#ff007f');
      grad.addColorStop(1, '#ffee00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 220, 90, 0, Math.PI * 2);
      ctx.fill();

      // Platforms
      state.platforms.forEach((p) => {
        ctx.fillStyle = '#16192b';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Neon Top Edge
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.width, p.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Obstacles
      state.obstacles.forEach((obs) => {
        ctx.fillStyle = obs.type === 'spikes' ? '#ff007f' : '#39ff14';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.shadowBlur = 0;
      });

      // Coins
      state.coinsList.forEach((c) => {
        if (c.collected) return;
        ctx.fillStyle = '#ffee00';
        ctx.shadowColor = '#ffee00';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Runner Character
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.fillRect(state.x, state.y, state.width, state.height);
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [gameOver, addCoins, addXp, recordHighScore]);

  const restartRunner = () => {
    runnerStateRef.current.x = 100;
    runnerStateRef.current.y = 360;
    runnerStateRef.current.vy = 0;
    runnerStateRef.current.dist = 0;
    runnerStateRef.current.coins = 0;
    runnerStateRef.current.speed = 6;
    runnerStateRef.current.platforms = [
      { x: 0, y: 420, width: 600, height: 120 },
      { x: 680, y: 390, width: 400, height: 150 },
    ];
    runnerStateRef.current.obstacles = [];
    runnerStateRef.current.coinsList = [];
    setGameOver(false);
    setDistance(0);
    setCoinsCollected(0);
    soundFx.playClick();
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-5xl mx-auto select-none">
      {/* HUD Header */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-t-xl px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Zap className="w-5 h-5" />
            <span>Distance: {distance}m</span>
          </div>

          <div className="flex items-center gap-2 text-yellow-400 font-bold">
            <Trophy className="w-4 h-4" />
            <span>Cyber Coins: {coinsCollected}</span>
          </div>
        </div>

        <button
          onClick={restartRunner}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-600 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Restart Dash
        </button>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full aspect-[16/9] bg-slate-950 border border-slate-800 rounded-b-xl overflow-hidden shadow-2xl">
        <canvas ref={canvasRef} width={960} height={540} className="w-full h-full" />

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <h2 className="text-4xl font-extrabold text-rose-500 tracking-wider mb-2">RUNNER WIPEOUT!</h2>
            <p className="text-slate-300 mb-4">You failed to clear the cyber rooftop obstacle.</p>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex gap-6 text-center">
              <div>
                <div className="text-xs text-slate-400">Distance</div>
                <div className="text-2xl font-bold text-cyan-400">{distance}m</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Coins Collected</div>
                <div className="text-2xl font-bold text-yellow-400">{coinsCollected}</div>
              </div>
            </div>
            <button
              onClick={restartRunner}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform hover:scale-105"
            >
              RUN AGAIN
            </button>
          </div>
        )}
      </div>

      <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
        <div>Controls: Space / W / Up Arrow to Jump (Press twice for Double Jump) • S / Down Arrow to Fast Fall</div>
        <div className="text-cyan-400 font-semibold">Tip: Double jump across wide gaps between neon rooftops!</div>
      </div>
    </div>
  );
};
