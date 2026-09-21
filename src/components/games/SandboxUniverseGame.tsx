import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { RefreshCw, Sparkles } from 'lucide-react';

interface CelestialBody {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  color: string;
  isStar?: boolean;
}

export const SandboxUniverseGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { recordHighScore, addXp, addCoins } = useGame();

  const [selectedTool, setSelectedTool] = useState<'planet' | 'star' | 'laser'>('planet');

  const stateRef = useRef({
    bodies: [] as CelestialBody[],
    mouse: { x: 400, y: 300 },
  });

  const initSystem = () => {
    // Center Star
    const sun: CelestialBody = {
      id: 'sun',
      x: 480,
      y: 270,
      vx: 0,
      vy: 0,
      mass: 8000,
      radius: 24,
      color: '#ffee00',
      isStar: true,
    };

    // Initial Planets
    const initialPlanets: CelestialBody[] = [
      { id: 'p1', x: 480, y: 150, vx: 4.5, vy: 0, mass: 50, radius: 8, color: '#00f0ff' },
      { id: 'p2', x: 480, y: 100, vx: 3.5, vy: 0, mass: 80, radius: 12, color: '#ff007f' },
      { id: 'p3', x: 480, y: 410, vx: -3.8, vy: 0, mass: 60, radius: 10, color: '#39ff14' },
    ];

    stateRef.current.bodies = [sun, ...initialPlanets];
  };

  useEffect(() => {
    initSystem();

    const handleMouseDown = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (selectedTool === 'planet') {
        soundFx.playCoin();
        const colors = ['#00f0ff', '#ff007f', '#39ff14', '#ffee00', '#9d4edd'];
        stateRef.current.bodies.push({
          id: `p-${Date.now()}`,
          x: clickX,
          y: clickY,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          mass: 40 + Math.random() * 60,
          radius: 7 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
        recordHighScore('sandbox-universe', stateRef.current.bodies.length * 100);
        addXp(20);
        addCoins(15);
      } else if (selectedTool === 'star') {
        soundFx.playPowerup();
        stateRef.current.bodies.push({
          id: `star-${Date.now()}`,
          x: clickX,
          y: clickY,
          vx: 0,
          vy: 0,
          mass: 6000,
          radius: 20,
          color: '#ffee00',
          isStar: true,
        });
      } else if (selectedTool === 'laser') {
        soundFx.playHit();
        // Destroy nearest planet
        const idx = stateRef.current.bodies.findIndex(
          (b) => !b.isStar && Math.hypot(b.x - clickX, b.y - clickY) < 40
        );
        if (idx >= 0) {
          stateRef.current.bodies.splice(idx, 1);
        }
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [selectedTool, addCoins, addXp, recordHighScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const { bodies } = stateRef.current;
      const G = 0.8;

      // N-Body Gravitational Physics
      for (let i = 0; i < bodies.length; i++) {
        const b1 = bodies[i];
        if (b1.isStar) continue; // Keep star stable

        for (let j = 0; j < bodies.length; j++) {
          if (i === j) continue;
          const b2 = bodies[j];

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 15) {
            const force = (G * b1.mass * b2.mass) / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            b1.vx += fx / b1.mass;
            b1.vy += fy / b1.mass;
          }
        }

        b1.x += b1.vx;
        b1.y += b1.vy;
      }

      // --- CANVAS RENDERING ---
      ctx.fillStyle = '#050711';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let s = 0; s < 40; s++) {
        ctx.fillRect((s * 97) % canvas.width, (s * 53) % canvas.height, 2, 2);
      }

      // Draw Bodies & Orbit Trails
      bodies.forEach((b) => {
        ctx.shadowColor = b.color;
        ctx.shadowBlur = b.isStar ? 30 : 12;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative flex flex-col items-center w-full max-w-5xl mx-auto select-none">
      {/* HUD Header */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-t-xl px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Sparkles className="w-5 h-5" />
            <span>Active Celestial Bodies: {stateRef.current.bodies.length}</span>
          </div>

          {/* Tools Toggle */}
          <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl gap-1">
            <button
              onClick={() => setSelectedTool('planet')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                selectedTool === 'planet' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              + Spawn Planet
            </button>
            <button
              onClick={() => setSelectedTool('star')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                selectedTool === 'star' ? 'bg-yellow-400 text-slate-950' : 'text-slate-400'
              }`}
            >
              + Spawn Sun
            </button>
            <button
              onClick={() => setSelectedTool('laser')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                selectedTool === 'laser' ? 'bg-rose-500 text-white' : 'text-slate-400'
              }`}
            >
              💥 Laser Beam
            </button>
          </div>
        </div>

        <button
          onClick={initSystem}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-600 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Solar System
        </button>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full aspect-[16/9] bg-slate-950 border border-slate-800 rounded-b-xl overflow-hidden shadow-2xl">
        <canvas ref={canvasRef} width={960} height={540} className="w-full h-full cursor-crosshair" />
      </div>

      <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
        <div>Controls: Click anywhere on screen to spawn planets, stars, or unleash death lasers</div>
        <div className="text-cyan-400 font-semibold">Tip: Spawn multiple planets at different angles to simulate orbital gravity!</div>
      </div>
    </div>
  );
};
