import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { RefreshCw, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BattleUnit {
  id: string;
  team: 'Red' | 'Blue';
  type: 'warrior' | 'archer' | 'giant';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
  range: number;
  speed: number;
  color: string;
}

export const RedBlueLeaderGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { recordHighScore, addXp, addCoins } = useGame();

  const [battleStarted, setBattleStarted] = useState(false);
  const [winner, setWinner] = useState<'Red' | 'Blue' | null>(null);
  const [blueCount, setBlueCount] = useState(0);
  const [redCount, setRedCount] = useState(0);

  const stateRef = useRef({
    units: [] as BattleUnit[],
    started: false,
  });

  const initBattlefield = () => {
    const blues: BattleUnit[] = [
      { id: 'b1', team: 'Blue', type: 'giant', x: 120, y: 270, hp: 400, maxHp: 400, attack: 35, range: 25, speed: 0.8, color: '#00f0ff' },
      { id: 'b2', team: 'Blue', type: 'warrior', x: 180, y: 180, hp: 120, maxHp: 120, attack: 20, range: 18, speed: 1.6, color: '#00f0ff' },
      { id: 'b3', team: 'Blue', type: 'warrior', x: 180, y: 360, hp: 120, maxHp: 120, attack: 20, range: 18, speed: 1.6, color: '#00f0ff' },
      { id: 'b4', team: 'Blue', type: 'archer', x: 80, y: 200, hp: 70, maxHp: 70, attack: 15, range: 160, speed: 1.2, color: '#00f0ff' },
      { id: 'b5', team: 'Blue', type: 'archer', x: 80, y: 340, hp: 70, maxHp: 70, attack: 15, range: 160, speed: 1.2, color: '#00f0ff' },
    ];

    const reds: BattleUnit[] = [
      { id: 'r1', team: 'Red', type: 'giant', x: 840, y: 270, hp: 400, maxHp: 400, attack: 35, range: 25, speed: 0.8, color: '#ff007f' },
      { id: 'r2', team: 'Red', type: 'warrior', x: 780, y: 180, hp: 120, maxHp: 120, attack: 20, range: 18, speed: 1.6, color: '#ff007f' },
      { id: 'r3', team: 'Red', type: 'warrior', x: 780, y: 360, hp: 120, maxHp: 120, attack: 20, range: 18, speed: 1.6, color: '#ff007f' },
      { id: 'r4', team: 'Red', type: 'archer', x: 880, y: 200, hp: 70, maxHp: 70, attack: 15, range: 160, speed: 1.2, color: '#ff007f' },
      { id: 'r5', team: 'Red', type: 'archer', x: 880, y: 340, hp: 70, maxHp: 70, attack: 15, range: 160, speed: 1.2, color: '#ff007f' },
    ];

    stateRef.current.units = [...blues, ...reds];
    stateRef.current.started = false;
    setBattleStarted(false);
    setWinner(null);
    setBlueCount(blues.length);
    setRedCount(reds.length);
  };

  useEffect(() => {
    initBattlefield();
  }, []);

  const spawnUnit = (team: 'Blue' | 'Red') => {
    soundFx.playCoin();
    const isBlue = team === 'Blue';
    const newUnit: BattleUnit = {
      id: `${team.toLowerCase()}-${Date.now()}-${Math.random()}`,
      team,
      type: Math.random() < 0.2 ? 'giant' : Math.random() < 0.5 ? 'archer' : 'warrior',
      x: isBlue ? 50 + Math.random() * 200 : 700 + Math.random() * 200,
      y: 80 + Math.random() * 380,
      hp: 120,
      maxHp: 120,
      attack: 22,
      range: 20,
      speed: 1.5,
      color: isBlue ? '#00f0ff' : '#ff007f',
    };

    stateRef.current.units.push(newUnit);
    if (isBlue) setBlueCount((prev) => prev + 1);
    else setRedCount((prev) => prev + 1);
  };

  const startSimulation = () => {
    stateRef.current.started = true;
    setBattleStarted(true);
    soundFx.playPowerup();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const { units, started } = stateRef.current;

      if (started && !winner) {
        // Battle Physics & Movement
        units.forEach((u) => {
          if (u.hp <= 0) return;

          // Find closest enemy
          const enemies = units.filter((e) => e.hp > 0 && e.team !== u.team);
          if (enemies.length > 0) {
            let closest = enemies[0];
            let minDist = Math.hypot(closest.x - u.x, closest.y - u.y);

            for (let i = 1; i < enemies.length; i++) {
              const dist = Math.hypot(enemies[i].x - u.x, enemies[i].y - u.y);
              if (dist < minDist) {
                minDist = dist;
                closest = enemies[i];
              }
            }

            // Move towards enemy if out of attack range
            if (minDist > u.range) {
              const angle = Math.atan2(closest.y - u.y, closest.x - u.x);
              u.x += Math.cos(angle) * u.speed;
              u.y += Math.sin(angle) * u.speed;
            } else {
              // Attack!
              if (Math.random() < 0.05) {
                closest.hp -= u.attack;
                soundFx.playHit();
              }
            }
          }
        });

        // Update active squad counts
        const aliveBlue = units.filter((u) => u.hp > 0 && u.team === 'Blue');
        const aliveRed = units.filter((u) => u.hp > 0 && u.team === 'Red');

        setBlueCount(aliveBlue.length);
        setRedCount(aliveRed.length);

        if (aliveBlue.length === 0 && aliveRed.length > 0) {
          setWinner('Red');
          soundFx.playDefeat();
        } else if (aliveRed.length === 0 && aliveBlue.length > 0) {
          setWinner('Blue');
          soundFx.playVictory();
          confetti({ particleCount: 100, spread: 70 });
          recordHighScore('red-blue-leader-2', aliveBlue.length * 500);
          addXp(250);
          addCoins(200);
        }
      }

      // --- CANVAS RENDERING ---
      ctx.fillStyle = '#0a0d18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center Divider Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();

      // Render Units
      units.forEach((u) => {
        if (u.hp <= 0) return;

        const size = u.type === 'giant' ? 22 : u.type === 'archer' ? 12 : 16;
        ctx.shadowColor = u.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = u.color;
        ctx.beginPath();
        ctx.arc(u.x, u.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Health bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(u.x - 15, u.y - size - 8, 30, 4);
        ctx.fillStyle = u.color;
        ctx.fillRect(u.x - 15, u.y - size - 8, (u.hp / u.maxHp) * 30, 4);
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [winner, addCoins, addXp, recordHighScore]);

  return (
    <div className="relative flex flex-col items-center w-full max-w-5xl mx-auto select-none">
      {/* HUD Header */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-t-xl px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-base">
            <span>BLUE ARMY: {blueCount}</span>
          </div>

          <div className="text-slate-500 font-bold">VS</div>

          <div className="flex items-center gap-2 text-rose-400 font-extrabold text-base">
            <span>RED ARMY: {redCount}</span>
          </div>

          {!battleStarted && (
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => spawnUnit('Blue')}
                className="bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold text-xs px-3 py-1 rounded-lg hover:bg-cyan-900"
              >
                + Deploy Blue Unit
              </button>
              <button
                onClick={() => spawnUnit('Red')}
                className="bg-rose-950 border border-rose-500/40 text-rose-300 font-bold text-xs px-3 py-1 rounded-lg hover:bg-rose-900"
              >
                + Deploy Red Unit
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!battleStarted ? (
            <button
              onClick={startSimulation}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-lg transition transform hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" /> START BATTLE SIMULATION
            </button>
          ) : (
            <button
              onClick={initBattlefield}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-600 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Army Setup
            </button>
          )}
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full aspect-[16/9] bg-slate-950 border border-slate-800 rounded-b-xl overflow-hidden shadow-2xl">
        <canvas ref={canvasRef} width={960} height={540} className="w-full h-full cursor-pointer" />

        {/* Victory Overlay */}
        {winner && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <h2 className="text-4xl font-extrabold text-white tracking-wider mb-2">{winner.toUpperCase()} ARMY VICTORIOUS!</h2>
            <p className="text-slate-300 mb-6">Tactical superiority achieved on the battlefield.</p>
            <button
              onClick={initBattlefield}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform hover:scale-105"
            >
              RE-DEPLOY UNITS
            </button>
          </div>
        )}
      </div>

      <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
        <div>Controls: Click Deploy Buttons to customize army units • Click Start Battle to simulate automated ragdoll warfare</div>
        <div className="text-cyan-400 font-semibold">Tip: Mix heavy Giants with rear Archers for ultimate army balance!</div>
      </div>
    </div>
  );
};
