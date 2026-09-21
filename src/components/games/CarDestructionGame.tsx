import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { Trophy, RefreshCw, Zap, Shield } from 'lucide-react';

interface ObstacleCar {
  id: string;
  x: number;
  y: number;
  speed: number;
  width: number;
  height: number;
  color: string;
  destroyed: boolean;
}

export const CarDestructionGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { recordHighScore, addXp, addCoins } = useGame();

  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(60);
  const [durability, setDurability] = useState(100);
  const [gameOver, setGameOver] = useState(false);

  const stateRef = useRef({
    carX: 480,
    carY: 420,
    carSpeed: 8,
    durability: 100,
    score: 0,
    obstacles: [] as ObstacleCar[],
    keys: { left: false, right: false, up: false, down: false, nitro: false },
  });

  const initGame = () => {
    stateRef.current.carX = 480;
    stateRef.current.durability = 100;
    stateRef.current.score = 0;
    stateRef.current.carSpeed = 8;
    stateRef.current.obstacles = [];

    setDurability(100);
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    initGame();

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'a' || k === 'arrowleft') stateRef.current.keys.left = true;
      if (k === 'd' || k === 'arrowright') stateRef.current.keys.right = true;
      if (k === 'w' || k === 'arrowup') stateRef.current.keys.up = true;
      if (k === 's' || k === 'arrowdown') stateRef.current.keys.down = true;
      if (k === 'shift') stateRef.current.keys.nitro = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'a' || k === 'arrowleft') stateRef.current.keys.left = false;
      if (k === 'd' || k === 'arrowright') stateRef.current.keys.right = false;
      if (k === 'w' || k === 'arrowup') stateRef.current.keys.up = false;
      if (k === 's' || k === 'arrowdown') stateRef.current.keys.down = false;
      if (k === 'shift') stateRef.current.keys.nitro = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const { keys, obstacles } = stateRef.current;

      if (!gameOver) {
        // Car Controls & Movement
        const speedBoost = keys.nitro ? 14 : keys.up ? 10 : 7;
        stateRef.current.carSpeed = speedBoost;
        setSpeed(Math.floor(speedBoost * 18));

        if (keys.left) stateRef.current.carX -= 7;
        if (keys.right) stateRef.current.carX += 7;

        stateRef.current.carX = Math.max(180, Math.min(780, stateRef.current.carX));

        // Score tick
        stateRef.current.score += Math.floor(speedBoost / 2);
        setScore(stateRef.current.score);

        // Spawn traffic cars
        if (Math.random() < 0.04 && obstacles.length < 6) {
          const colors = ['#ff007f', '#39ff14', '#ffee00', '#9d4edd', '#ff7700'];
          obstacles.push({
            id: `car-${Date.now()}-${Math.random()}`,
            x: 200 + Math.random() * 540,
            y: -100,
            speed: 3 + Math.random() * 4,
            width: 44,
            height: 75,
            color: colors[Math.floor(Math.random() * colors.length)],
            destroyed: false,
          });
        }

        // Move Traffic & Check Crash Collision
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.y += speedBoost - obs.speed;

          // Crash check
          const playerX = stateRef.current.carX;
          const playerY = stateRef.current.carY;
          if (
            !obs.destroyed &&
            Math.abs(playerX - obs.x) < 40 &&
            Math.abs(playerY - obs.y) < 65
          ) {
            obs.destroyed = true;
            stateRef.current.durability -= keys.nitro ? 15 : 25;
            setDurability(Math.max(0, stateRef.current.durability));
            soundFx.playHit();

            if (stateRef.current.durability <= 0) {
              setGameOver(true);
              soundFx.playDefeat();
              recordHighScore('car-destruction-3d', stateRef.current.score);
              addXp(200);
              addCoins(180);
            }
          }

          if (obs.y > canvas.height + 100) obstacles.splice(i, 1);
        }
      }

      // --- CANVAS RENDERING ---
      ctx.fillStyle = '#080b14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Highway Road Surface
      ctx.fillStyle = '#121626';
      ctx.fillRect(160, 0, 640, canvas.height);

      // Road Borders
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(160, 0);
      ctx.lineTo(160, canvas.height);
      ctx.moveTo(800, 0);
      ctx.lineTo(800, canvas.height);
      ctx.stroke();

      // Animated Center Lanes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.setLineDash([30, 30]);
      ctx.lineDashOffset = -Date.now() * 0.1;

      [320, 480, 640].forEach((laneX) => {
        ctx.beginPath();
        ctx.moveTo(laneX, 0);
        ctx.lineTo(laneX, canvas.height);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Draw Traffic Cars
      obstacles.forEach((obs) => {
        ctx.shadowColor = obs.color;
        ctx.shadowBlur = obs.destroyed ? 0 : 15;
        ctx.fillStyle = obs.destroyed ? '#374151' : obs.color;
        ctx.fillRect(obs.x - obs.width / 2, obs.y - obs.height / 2, obs.width, obs.height);
        ctx.shadowBlur = 0;
      });

      // Draw Player Car
      const pX = stateRef.current.carX;
      const pY = stateRef.current.carY;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(pX - 22, pY - 38, 44, 76);

      // Windshield & Headlights
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pX - 16, pY - 20, 32, 16);
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameOver, addCoins, addXp, recordHighScore]);

  return (
    <div className="relative flex flex-col items-center w-full max-w-5xl mx-auto select-none">
      {/* HUD Header */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-t-xl px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <div className="w-32 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${durability}%` }}
              />
            </div>
            <span className="text-xs font-bold text-cyan-400">{durability}% Hull</span>
          </div>

          <div className="flex items-center gap-2 text-yellow-400 font-bold">
            <Zap className="w-4 h-4" />
            <span>Speed: {speed} MPH</span>
          </div>

          <div className="flex items-center gap-2 text-purple-300 font-bold">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span>Score: {score}</span>
          </div>
        </div>

        <button
          onClick={initGame}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-600 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Restart Arena
        </button>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full aspect-[16/9] bg-slate-950 border border-slate-800 rounded-b-xl overflow-hidden shadow-2xl">
        <canvas ref={canvasRef} width={960} height={540} className="w-full h-full cursor-none" />

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <h2 className="text-4xl font-extrabold text-rose-500 tracking-wider mb-2">VEHICLE TOTALED!</h2>
            <p className="text-slate-300 mb-6">Your sports car suffered maximum crash damage.</p>
            <button
              onClick={initGame}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform hover:scale-105"
            >
              SPAWN NEW CAR
            </button>
          </div>
        )}
      </div>

      <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
        <div>Controls: A/D or Left/Right Arrows to Steer • W / Up to Accelerate • Shift for NOS Nitro</div>
        <div className="text-cyan-400 font-semibold">Tip: Use Nitro to smash lighter obstacle traffic for bonus points!</div>
      </div>
    </div>
  );
};
