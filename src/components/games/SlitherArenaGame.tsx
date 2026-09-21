import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { Trophy, RefreshCw, Zap } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Snake {
  id: string;
  name: string;
  body: Point[];
  angle: number;
  speed: number;
  color: string;
  score: number;
  isBot: boolean;
}

interface FoodOrb {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  value: number;
}

export const SlitherArenaGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { userProfile, recordHighScore, addXp, addCoins } = useGame();

  const [score, setScore] = useState(10);
  const [rank, setRank] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number; color: string }[]>([]);

  const gameStateRef = useRef({
    player: {
      id: userProfile.username,
      name: userProfile.username,
      body: [] as Point[],
      angle: 0,
      speed: 3,
      color: userProfile.avatar.color || '#00f0ff',
      score: 10,
      isBot: false,
    } as Snake,
    bots: [] as Snake[],
    orbs: [] as FoodOrb[],
    isBoosting: false,
    mouse: { x: 400, y: 300 },
  });

  useEffect(() => {
    const initGame = () => {
      // Setup player initial body
      const playerBody: Point[] = [];
      for (let i = 0; i < 15; i++) {
        playerBody.push({ x: 400 - i * 5, y: 300 });
      }
      gameStateRef.current.player.body = playerBody;
      gameStateRef.current.player.score = 10;

      // Setup Bots
      const botNames = ['HyperSlither', 'NeonPython', 'CyberViper', 'KobraX', 'VortexSnake'];
      const botColors = ['#ff007f', '#39ff14', '#ffee00', '#9d4edd', '#ff7700'];
      const bots: Snake[] = [];

      botNames.forEach((name, i) => {
        const body: Point[] = [];
        const startX = 100 + Math.random() * 700;
        const startY = 100 + Math.random() * 400;
        for (let j = 0; j < 12 + Math.floor(Math.random() * 10); j++) {
          body.push({ x: startX - j * 5, y: startY });
        }
        bots.push({
          id: `bot-${i}`,
          name,
          body,
          angle: Math.random() * Math.PI * 2,
          speed: 2.5,
          color: botColors[i % botColors.length],
          score: 10 + body.length * 2,
          isBot: true,
        });
      });
      gameStateRef.current.bots = bots;

      // Setup Food Orbs
      const orbs: FoodOrb[] = [];
      const orbColors = ['#00f0ff', '#ff007f', '#39ff14', '#ffee00', '#9d4edd'];
      for (let i = 0; i < 80; i++) {
        orbs.push({
          id: `orb-${i}`,
          x: Math.random() * 960,
          y: Math.random() * 540,
          radius: 3 + Math.random() * 4,
          color: orbColors[Math.floor(Math.random() * orbColors.length)],
          value: Math.floor(Math.random() * 3) + 1,
        });
      }
      gameStateRef.current.orbs = orbs;
    };

    initGame();

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      gameStateRef.current.mouse.x = e.clientX - rect.left;
      gameStateRef.current.mouse.y = e.clientY - rect.top;
    };

    const handleMouseDown = () => {
      gameStateRef.current.isBoosting = true;
    };

    const handleMouseUp = () => {
      gameStateRef.current.isBoosting = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') gameStateRef.current.isBoosting = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') gameStateRef.current.isBoosting = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
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
      const { player, bots, orbs, mouse, isBoosting } = gameStateRef.current;

      if (!gameOver) {
        // Player head rotation towards mouse
        const head = player.body[0];
        if (head) {
          const dx = mouse.x - head.x;
          const dy = mouse.y - head.y;
          player.angle = Math.atan2(dy, dx);

          player.speed = isBoosting && player.body.length > 5 ? 5.5 : 3;

          // Move player head
          const newHead = {
            x: head.x + Math.cos(player.angle) * player.speed,
            y: head.y + Math.sin(player.angle) * player.speed,
          };

          // Wrap boundaries
          if (newHead.x < 0) newHead.x = canvas.width;
          if (newHead.x > canvas.width) newHead.x = 0;
          if (newHead.y < 0) newHead.y = canvas.height;
          if (newHead.y > canvas.height) newHead.y = 0;

          player.body.unshift(newHead);
          if (player.body.length > player.score) {
            player.body.pop();
          }

          // Boost drops length slowly
          if (isBoosting && Math.random() < 0.3 && player.body.length > 5) {
            player.score = Math.max(5, player.score - 1);
          }
        }

        // Bots movement & AI
        bots.forEach((bot) => {
          const bHead = bot.body[0];
          if (!bHead) return;

          // Random direction changes
          if (Math.random() < 0.04) {
            bot.angle += (Math.random() - 0.5) * 1.5;
          }

          const bNewHead = {
            x: bHead.x + Math.cos(bot.angle) * bot.speed,
            y: bHead.y + Math.sin(bot.angle) * bot.speed,
          };

          if (bNewHead.x < 0) bNewHead.x = canvas.width;
          if (bNewHead.x > canvas.width) bNewHead.x = 0;
          if (bNewHead.y < 0) bNewHead.y = canvas.height;
          if (bNewHead.y > canvas.height) bNewHead.y = 0;

          bot.body.unshift(bNewHead);
          if (bot.body.length > bot.score) {
            bot.body.pop();
          }
        });

        // Check Orb Pickups
        const allSnakes = [player, ...bots];
        allSnakes.forEach((s) => {
          const sHead = s.body[0];
          if (!sHead) return;

          for (let i = orbs.length - 1; i >= 0; i--) {
            const orb = orbs[i];
            if (Math.hypot(orb.x - sHead.x, orb.y - sHead.y) < 18) {
              s.score += orb.value;
              if (s.id === player.id) {
                setScore(s.score);
                soundFx.playCoin();
              }
              // Respawn orb
              orbs[i] = {
                id: `orb-${Date.now()}-${Math.random()}`,
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: 3 + Math.random() * 4,
                color: ['#00f0ff', '#ff007f', '#39ff14', '#ffee00'][Math.floor(Math.random() * 4)],
                value: Math.floor(Math.random() * 3) + 1,
              };
            }
          }
        });

        // Player Collision with Bots bodies
        if (head) {
          bots.forEach((bot) => {
            bot.body.forEach((seg, idx) => {
              if (idx > 2 && Math.hypot(seg.x - head.x, seg.y - head.y) < 10) {
                setGameOver(true);
                soundFx.playDefeat();
                recordHighScore('slither-arena', player.score);
                addXp(150);
                addCoins(100);
              }
            });
          });
        }

        // Leaderboard Calculation
        const scores = allSnakes
          .map((s) => ({ name: s.name, score: s.score, color: s.color }))
          .sort((a, b) => b.score - a.score);

        setLeaderboard(scores);
        const myRank = scores.findIndex((s) => s.name === player.name) + 1;
        setRank(myRank);
      }

      // --- DRAW CANVAS ---
      ctx.fillStyle = '#070913';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background Hex Grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Orbs
      orbs.forEach((orb) => {
        ctx.shadowColor = orb.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = orb.color;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Snakes
      const allSnakesToDraw = [...bots, player];
      allSnakesToDraw.forEach((s) => {
        if (s.body.length === 0) return;

        ctx.shadowColor = s.color;
        ctx.shadowBlur = 12;

        for (let i = s.body.length - 1; i >= 0; i--) {
          const seg = s.body[i];
          const radius = i === 0 ? 9 : Math.max(3, 8 - (i / s.body.length) * 3);
          ctx.fillStyle = i === 0 ? '#ffffff' : s.color;
          ctx.beginPath();
          ctx.arc(seg.x, seg.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Head Eyes & Name
        const h = s.body[0];
        if (h) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(s.name, h.x, h.y - 14);
        }
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [gameOver, addCoins, addXp, recordHighScore]);

  const restartGame = () => {
    setGameOver(false);
    setScore(10);
    const playerBody: Point[] = [];
    for (let i = 0; i < 15; i++) {
      playerBody.push({ x: 400 - i * 5, y: 300 });
    }
    gameStateRef.current.player.body = playerBody;
    gameStateRef.current.player.score = 10;
    soundFx.playClick();
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-5xl mx-auto select-none">
      {/* Game HUD */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-t-xl px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Zap className="w-5 h-5" />
            <span>Length: {score}</span>
          </div>

          <div className="flex items-center gap-2 text-yellow-400 font-bold">
            <Trophy className="w-4 h-4" />
            <span>Arena Rank: #{rank}</span>
          </div>
        </div>

        <button
          onClick={restartGame}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-600 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Restart Arena
        </button>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full aspect-[16/9] bg-slate-950 border border-slate-800 rounded-b-xl overflow-hidden shadow-2xl">
        <canvas ref={canvasRef} width={960} height={540} className="w-full h-full cursor-none" />

        {/* Live Leaderboard Overlay */}
        <div className="absolute top-4 right-4 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 w-48 shadow-xl">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" /> Leaderboard
          </div>
          <div className="flex flex-col gap-1 text-xs">
            {leaderboard.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="truncate max-w-[110px]" style={{ color: item.color }}>
                  #{idx + 1} {item.name}
                </span>
                <span className="font-mono text-slate-300">{item.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <h2 className="text-4xl font-extrabold text-rose-500 tracking-wider mb-2">SERPENT DESTROYED!</h2>
            <p className="text-slate-300 mb-4">You collided with an opponent's trail.</p>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex gap-6 text-center">
              <div>
                <div className="text-xs text-slate-400">Final Length</div>
                <div className="text-2xl font-bold text-cyan-400">{score}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Final Rank</div>
                <div className="text-2xl font-bold text-yellow-400">#{rank}</div>
              </div>
            </div>
            <button
              onClick={restartGame}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform hover:scale-105"
            >
              RE-ENTER ARENA
            </button>
          </div>
        )}
      </div>

      <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
        <div>Controls: Move mouse to steer snake • Hold Click or Spacebar to Turbo Boost</div>
        <div className="text-yellow-400 font-semibold">Tip: Trap opponent head on your body to devour their plasma!</div>
      </div>
    </div>
  );
};
