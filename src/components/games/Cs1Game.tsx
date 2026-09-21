import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { RefreshCw, Shield, Crosshair } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Soldier {
  id: string;
  name: string;
  team: 'CT' | 'T';
  x: number;
  y: number;
  angle: number;
  hp: number;
  maxHp: number;
  weapon: 'AK47' | 'M4A1' | 'AWP' | 'DEAGLE';
  kills: number;
  color: string;
  isBot: boolean;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  ownerId: string;
  team: 'CT' | 'T';
}

export const Cs1Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { userProfile, recordHighScore, addXp, addCoins } = useGame();

  const [tScore, setTScore] = useState(0);
  const [ctScore, setCtScore] = useState(0);
  const [kills, setKills] = useState(0);
  const [hp, setHp] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);

  const stateRef = useRef({
    player: {
      id: userProfile.username,
      name: userProfile.username,
      team: 'CT' as const,
      x: 150,
      y: 270,
      angle: 0,
      hp: 100,
      maxHp: 100,
      weapon: 'M4A1' as const,
      kills: 0,
      color: '#00f0ff',
      isBot: false,
    } as Soldier,
    soldiers: [] as Soldier[],
    bullets: [] as Bullet[],
    keys: { w: false, a: false, s: false, d: false },
    mouse: { x: 400, y: 300 },
    bombPlanted: false,
    bombTimer: 40,
  });

  const initRound = () => {
    stateRef.current.player.hp = 100;
    stateRef.current.player.x = 120;
    stateRef.current.player.y = 200 + Math.random() * 140;

    const bots: Soldier[] = [
      // Counter-Terrorists (CT)
      { id: 'ct-1', name: 'SAS_Alpha', team: 'CT', x: 100, y: 120, angle: 0, hp: 100, maxHp: 100, weapon: 'M4A1', kills: 0, color: '#00f0ff', isBot: true },
      { id: 'ct-2', name: 'GIGN_Viper', team: 'CT', x: 100, y: 420, angle: 0, hp: 100, maxHp: 100, weapon: 'AWP', kills: 0, color: '#00f0ff', isBot: true },
      // Terrorists (T)
      { id: 't-1', name: 'Phoenix_Lead', team: 'T', x: 840, y: 150, angle: Math.PI, hp: 100, maxHp: 100, weapon: 'AK47', kills: 0, color: '#ff007f', isBot: true },
      { id: 't-2', name: 'Elite_Crew', team: 'T', x: 840, y: 270, angle: Math.PI, hp: 100, maxHp: 100, weapon: 'AK47', kills: 0, color: '#ff007f', isBot: true },
      { id: 't-3', name: 'Anarchist_X', team: 'T', x: 840, y: 390, angle: Math.PI, hp: 100, maxHp: 100, weapon: 'DEAGLE', kills: 0, color: '#ff007f', isBot: true },
    ];

    stateRef.current.soldiers = bots;
    stateRef.current.bullets = [];
    setHp(100);
    setGameOver(false);
    setRoundWinner(null);
  };

  useEffect(() => {
    initRound();

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') stateRef.current.keys.w = true;
      if (k === 'a' || k === 'arrowleft') stateRef.current.keys.a = true;
      if (k === 's' || k === 'arrowdown') stateRef.current.keys.s = true;
      if (k === 'd' || k === 'arrowright') stateRef.current.keys.d = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') stateRef.current.keys.w = false;
      if (k === 'a' || k === 'arrowleft') stateRef.current.keys.a = false;
      if (k === 's' || k === 'arrowdown') stateRef.current.keys.s = false;
      if (k === 'd' || k === 'arrowright') stateRef.current.keys.d = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      stateRef.current.mouse.x = e.clientX - rect.left;
      stateRef.current.mouse.y = e.clientY - rect.top;
    };

    const handleMouseDown = () => {
      const p = stateRef.current.player;
      if (p.hp <= 0) return;

      soundFx.playShoot();
      const speed = p.weapon === 'AWP' ? 22 : 14;
      const damage = p.weapon === 'AWP' ? 100 : p.weapon === 'AK47' ? 34 : 28;

      stateRef.current.bullets.push({
        x: p.x + Math.cos(p.angle) * 18,
        y: p.y + Math.sin(p.angle) * 18,
        vx: Math.cos(p.angle) * speed,
        vy: Math.sin(p.angle) * speed,
        damage,
        ownerId: p.id,
        team: p.team,
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const { player, soldiers, bullets, keys, mouse } = stateRef.current;

      if (!gameOver) {
        // Player Aiming & Movement
        if (player.hp > 0) {
          const dx = mouse.x - player.x;
          const dy = mouse.y - player.y;
          player.angle = Math.atan2(dy, dx);

          const moveSpd = 3.2;
          if (keys.w) player.y -= moveSpd;
          if (keys.s) player.y += moveSpd;
          if (keys.a) player.x -= moveSpd;
          if (keys.d) player.x += moveSpd;

          player.x = Math.max(20, Math.min(canvas.width - 20, player.x));
          player.y = Math.max(20, Math.min(canvas.height - 20, player.y));
        }

        // Bot AI behavior
        const allUnits = [player, ...soldiers];
        soldiers.forEach((bot) => {
          if (bot.hp <= 0) return;

          // Target enemies
          const enemies = allUnits.filter((u) => u.hp > 0 && u.team !== bot.team);
          if (enemies.length > 0) {
            const target = enemies[0];
            const tdx = target.x - bot.x;
            const tdy = target.y - bot.y;
            bot.angle = Math.atan2(tdy, tdx);

            // Move towards target
            bot.x += Math.cos(bot.angle) * 1.6;
            bot.y += Math.sin(bot.angle) * 1.6;

            // Bot shoot
            if (Math.random() < 0.025) {
              bullets.push({
                x: bot.x + Math.cos(bot.angle) * 18,
                y: bot.y + Math.sin(bot.angle) * 18,
                vx: Math.cos(bot.angle) * 12,
                vy: Math.sin(bot.angle) * 12,
                damage: 25,
                ownerId: bot.id,
                team: bot.team,
              });
            }
          }
        });

        // Bullets Physics & Collision
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          b.x += b.vx;
          b.y += b.vy;

          if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
            continue;
          }

          // Hit check
          for (let u of allUnits) {
            if (u.hp > 0 && u.team !== b.team) {
              if (Math.hypot(b.x - u.x, b.y - u.y) < 16) {
                u.hp -= b.damage;
                soundFx.playHit();
                bullets.splice(i, 1);

                if (u.id === player.id) {
                  setHp(Math.max(0, player.hp));
                }

                if (u.hp <= 0) {
                  if (b.ownerId === player.id) {
                    player.kills += 1;
                    setKills(player.kills);
                    soundFx.playCoin();
                    recordHighScore('cs-1', player.kills * 500);
                  }
                }
                break;
              }
            }
          }
        }

        // Check Round Win Condition
        const aliveCT = allUnits.filter((u) => u.hp > 0 && u.team === 'CT');
        const aliveT = allUnits.filter((u) => u.hp > 0 && u.team === 'T');

        if (aliveCT.length === 0) {
          setRoundWinner('TERRORISTS WIN');
          setTScore((prev) => prev + 1);
          setGameOver(true);
          soundFx.playDefeat();
        } else if (aliveT.length === 0) {
          setRoundWinner('COUNTER-TERRORISTS WIN');
          setCtScore((prev) => prev + 1);
          setGameOver(true);
          soundFx.playVictory();
          confetti({ particleCount: 100, spread: 70 });
          addXp(200);
          addCoins(150);
        }
      }

      // --- CANVAS RENDERING ---
      ctx.fillStyle = '#0f121d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dust2 / CS Tactical Map Obstacles
      ctx.fillStyle = '#1c2236';
      ctx.fillRect(380, 140, 200, 260); // Center B site crates
      ctx.strokeStyle = '#00f0ff';
      ctx.strokeRect(380, 140, 200, 260);

      // Bomb Site B Target Zone
      ctx.strokeStyle = 'rgba(255, 0, 127, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(480, 270, 60, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 0, 127, 0.8)';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('BOMB SITE B', 440, 275);

      // Draw Bullets
      bullets.forEach((b) => {
        ctx.fillStyle = b.team === 'CT' ? '#00f0ff' : '#ff007f';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Soldiers
      const allUnitsToDraw = [player, ...soldiers];
      allUnitsToDraw.forEach((u) => {
        if (u.hp <= 0) return;

        ctx.save();
        ctx.translate(u.x, u.y);
        ctx.rotate(u.angle);

        // Body
        ctx.fillStyle = u.team === 'CT' ? '#00f0ff' : '#ff007f';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        // Rifle Barrel
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(10, -3, 16, 6);
        ctx.restore();

        // Name & HP Bar
        ctx.fillStyle = u.team === 'CT' ? '#00f0ff' : '#ff007f';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(u.name, u.x, u.y - 20);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(u.x - 18, u.y - 17, 36, 4);
        ctx.fillStyle = u.hp > 30 ? '#39ff14' : '#ff007f';
        ctx.fillRect(u.x - 18, u.y - 17, (u.hp / u.maxHp) * 36, 4);
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameOver, addCoins, addXp, recordHighScore]);

  return (
    <div className="relative flex flex-col items-center w-full max-w-5xl mx-auto select-none">
      {/* CS Scoreboard HUD */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-t-xl px-6 py-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-lg">
            <span>CT: {ctScore}</span>
          </div>

          <div className="text-slate-500 font-bold">VS</div>

          <div className="flex items-center gap-2 text-rose-400 font-extrabold text-lg">
            <span>T: {tScore}</span>
          </div>

          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs ml-4">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Health: {hp} HP</span>
          </div>

          <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs">
            <Crosshair className="w-4 h-4" />
            <span>Kills: {kills}</span>
          </div>
        </div>

        <button
          onClick={initRound}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-600 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Next Round
        </button>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full aspect-[16/9] bg-slate-950 border border-slate-800 rounded-b-xl overflow-hidden shadow-2xl">
        <canvas ref={canvasRef} width={960} height={540} className="w-full h-full cursor-crosshair" />

        {/* Round Winner Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <h2 className="text-4xl font-extrabold text-white tracking-wider mb-2">{roundWinner}</h2>
            <p className="text-slate-300 mb-6">Round concluded! Eliminate enemy squad to score points.</p>
            <button
              onClick={initRound}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform hover:scale-105"
            >
              START NEXT ROUND
            </button>
          </div>
        )}
      </div>

      <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
        <div>Controls: WASD to Move • Mouse to Aim • Left Click to Fire Assault Rifle</div>
        <div className="text-cyan-400 font-semibold">Tip: Aim directly at enemy heads for maximum damage!</div>
      </div>
    </div>
  );
};
