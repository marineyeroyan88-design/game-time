import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useMultiplayer } from '../../context/MultiplayerContext';
import { soundFx } from '../../utils/audio';
import { Trophy, RefreshCw, Shield, Crosshair } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlayerShip {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  hp: number;
  maxHp: number;
  score: number;
  kills: number;
  color: string;
  isBot: boolean;
  weapon: 'laser' | 'triple' | 'plasma';
  dashCooldown: number;
}

interface Bullet {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  damage: number;
}

interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: 'health' | 'triple' | 'plasma' | 'shield';
  color: string;
}

export const NeonStrikeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { userProfile, recordHighScore, addXp, addCoins } = useGame();
  const { currentRoom, broadcastGameState } = useMultiplayer();

  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [score, setScore] = useState(0);
  const [kills, setKills] = useState(0);
  const wave = 1;
  const [killFeed, setKillFeed] = useState<string[]>([]);

  const gameStateRef = useRef({
    player: {
      id: userProfile.username,
      name: userProfile.username,
      x: 400,
      y: 300,
      vx: 0,
      vy: 0,
      angle: 0,
      hp: 100,
      maxHp: 100,
      score: 0,
      kills: 0,
      color: userProfile.avatar.color || '#00f0ff',
      isBot: false,
      weapon: 'laser' as const,
      dashCooldown: 0,
    } as PlayerShip,
    bots: [] as PlayerShip[],
    bullets: [] as Bullet[],
    powerups: [] as PowerUp[],
    keys: { w: false, a: false, s: false, d: false, space: false, shift: false },
    mouse: { x: 400, y: 300 },
  });

  const addKillFeedMsg = (msg: string) => {
    setKillFeed((prev) => [msg, ...prev.slice(0, 4)]);
  };

  useEffect(() => {
    // Generate initial bot opponents
    const botCount = currentRoom ? Math.max(3, currentRoom.players.length) : 4;
    const initialBots: PlayerShip[] = [];
    const colors = ['#ff007f', '#39ff14', '#ffee00', '#9d4edd', '#ff7700'];

    for (let i = 0; i < botCount; i++) {
      initialBots.push({
        id: `bot-${i}`,
        name: currentRoom?.players[i]?.username || `Bot_Unit_${i + 1}`,
        x: 100 + Math.random() * 600,
        y: 100 + Math.random() * 400,
        vx: 0,
        vy: 0,
        angle: Math.random() * Math.PI * 2,
        hp: 80 + wave * 10,
        maxHp: 80 + wave * 10,
        score: 0,
        kills: 0,
        color: colors[i % colors.length],
        isBot: true,
        weapon: 'laser',
        dashCooldown: 0,
      });
    }

    gameStateRef.current.bots = initialBots;

    // Controls setup
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') gameStateRef.current.keys.w = true;
      if (k === 'a' || k === 'arrowleft') gameStateRef.current.keys.a = true;
      if (k === 's' || k === 'arrowdown') gameStateRef.current.keys.s = true;
      if (k === 'd' || k === 'arrowright') gameStateRef.current.keys.d = true;
      if (k === ' ') {
        gameStateRef.current.keys.space = true;
        fireBullet();
      }
      if (k === 'shift') {
        gameStateRef.current.keys.shift = true;
        triggerDash();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') gameStateRef.current.keys.w = false;
      if (k === 'a' || k === 'arrowleft') gameStateRef.current.keys.a = false;
      if (k === 's' || k === 'arrowdown') gameStateRef.current.keys.s = false;
      if (k === 'd' || k === 'arrowright') gameStateRef.current.keys.d = false;
      if (k === ' ') gameStateRef.current.keys.space = false;
      if (k === 'shift') gameStateRef.current.keys.shift = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      gameStateRef.current.mouse.x = e.clientX - rect.left;
      gameStateRef.current.mouse.y = e.clientY - rect.top;
    };

    const handleMouseDown = () => {
      fireBullet();
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
  }, [wave, currentRoom]);

  const triggerDash = () => {
    const p = gameStateRef.current.player;
    if (p.dashCooldown <= 0) {
      p.vx += Math.cos(p.angle) * 12;
      p.vy += Math.sin(p.angle) * 12;
      p.dashCooldown = 120; // 2 sec cooldown
      soundFx.playPowerup();
    }
  };

  const fireBullet = () => {
    const p = gameStateRef.current.player;
    if (p.hp <= 0) return;

    soundFx.playShoot();
    const speed = 12;

    if (p.weapon === 'triple') {
      [-0.2, 0, 0.2].forEach((spread) => {
        gameStateRef.current.bullets.push({
          id: `b-${Date.now()}-${Math.random()}`,
          ownerId: p.id,
          x: p.x + Math.cos(p.angle) * 20,
          y: p.y + Math.sin(p.angle) * 20,
          vx: Math.cos(p.angle + spread) * speed,
          vy: Math.sin(p.angle + spread) * speed,
          radius: 4,
          color: '#00f0ff',
          damage: 18,
        });
      });
    } else if (p.weapon === 'plasma') {
      gameStateRef.current.bullets.push({
        id: `b-${Date.now()}-${Math.random()}`,
        ownerId: p.id,
        x: p.x + Math.cos(p.angle) * 20,
        y: p.y + Math.sin(p.angle) * 20,
        vx: Math.cos(p.angle) * (speed * 0.8),
        vy: Math.sin(p.angle) * (speed * 0.8),
        radius: 9,
        color: '#ff007f',
        damage: 40,
      });
    } else {
      gameStateRef.current.bullets.push({
        id: `b-${Date.now()}-${Math.random()}`,
        ownerId: p.id,
        x: p.x + Math.cos(p.angle) * 20,
        y: p.y + Math.sin(p.angle) * 20,
        vx: Math.cos(p.angle) * speed,
        vy: Math.sin(p.angle) * speed,
        radius: 4,
        color: p.color,
        damage: 25,
      });
    }
  };

  // Main Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const state = gameStateRef.current;
      const { player, bots, bullets, powerups, keys, mouse } = state;

      if (player.hp > 0) {
        // Player aiming & movement
        const dx = mouse.x - player.x;
        const dy = mouse.y - player.y;
        player.angle = Math.atan2(dy, dx);

        const moveSpeed = 0.6;
        if (keys.w) player.vy -= moveSpeed;
        if (keys.s) player.vy += moveSpeed;
        if (keys.a) player.vx -= moveSpeed;
        if (keys.d) player.vx += moveSpeed;

        player.vx *= 0.92;
        player.vy *= 0.92;
        player.x += player.vx;
        player.y += player.vy;

        // Canvas bounds
        player.x = Math.max(20, Math.min(canvas.width - 20, player.x));
        player.y = Math.max(20, Math.min(canvas.height - 20, player.y));

        if (player.dashCooldown > 0) player.dashCooldown--;
      }

      // Spawn random powerups
      if (Math.random() < 0.005 && powerups.length < 4) {
        const types: PowerUp['type'][] = ['health', 'triple', 'plasma', 'shield'];
        const selected = types[Math.floor(Math.random() * types.length)];
        const colors = { health: '#39ff14', triple: '#00f0ff', plasma: '#ff007f', shield: '#ffee00' };
        powerups.push({
          id: `pow-${Date.now()}`,
          x: 50 + Math.random() * (canvas.width - 100),
          y: 50 + Math.random() * (canvas.height - 100),
          type: selected,
          color: colors[selected],
        });
      }

      // Update Bots AI
      bots.forEach((bot) => {
        if (bot.hp <= 0) return;

        // Bot target: player or powerup
        const targetX = player.hp > 0 ? player.x : canvas.width / 2;
        const targetY = player.hp > 0 ? player.y : canvas.height / 2;
        const bdx = targetX - bot.x;
        const bdy = targetY - bot.y;
        bot.angle = Math.atan2(bdy, bdx);

        bot.x += Math.cos(bot.angle) * 2;
        bot.y += Math.sin(bot.angle) * 2;

        // Bot Shooting
        if (Math.random() < 0.02 && player.hp > 0) {
          bullets.push({
            id: `b-bot-${Date.now()}-${Math.random()}`,
            ownerId: bot.id,
            x: bot.x + Math.cos(bot.angle) * 20,
            y: bot.y + Math.sin(bot.angle) * 20,
            vx: Math.cos(bot.angle) * 8,
            vy: Math.sin(bot.angle) * 8,
            radius: 4,
            color: bot.color,
            damage: 15,
          });
        }
      });

      // Bullets Update & Collision
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;

        // Boundary check
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
          bullets.splice(i, 1);
          continue;
        }

        // Hit player
        if (b.ownerId !== player.id && player.hp > 0) {
          const dist = Math.hypot(b.x - player.x, b.y - player.y);
          if (dist < 20 + b.radius) {
            player.hp -= b.damage;
            soundFx.playHit();
            bullets.splice(i, 1);

            if (player.hp <= 0) {
              setGameOver(true);
              soundFx.playDefeat();
              addKillFeedMsg(`💀 ${player.name} was eliminated!`);
            }
            continue;
          }
        }

        // Hit bots
        if (b.ownerId === player.id) {
          for (let j = 0; j < bots.length; j++) {
            const bot = bots[j];
            if (bot.hp <= 0) continue;
            const dist = Math.hypot(b.x - bot.x, b.y - bot.y);
            if (dist < 20 + b.radius) {
              bot.hp -= b.damage;
              soundFx.playHit();
              bullets.splice(i, 1);

              if (bot.hp <= 0) {
                player.score += 250;
                player.kills += 1;
                setScore(player.score);
                setKills(player.kills);
                soundFx.playCoin();
                addKillFeedMsg(`💥 ${player.name} eliminated ${bot.name}!`);

                // Check remaining active bots
                const activeBots = bots.filter((bt) => bt.hp > 0);
                if (activeBots.length === 0) {
                  setVictory(true);
                  soundFx.playVictory();
                  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                  recordHighScore('neon-strike', player.score);
                  addXp(300);
                  addCoins(250);
                }
              }
              break;
            }
          }
        }
      }

      // Powerups Pickup
      for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        if (player.hp > 0 && Math.hypot(p.x - player.x, p.y - player.y) < 30) {
          soundFx.playPowerup();
          if (p.type === 'health') player.hp = Math.min(player.maxHp, player.hp + 40);
          else if (p.type === 'triple') player.weapon = 'triple';
          else if (p.type === 'plasma') player.weapon = 'plasma';
          else if (p.type === 'shield') player.hp = Math.min(player.maxHp + 30, player.hp + 30);

          powerups.splice(i, 1);
          addKillFeedMsg(`⚡ ${player.name} acquired ${p.type.toUpperCase()} powerup!`);
        }
      }

      // Broadcast net state
      broadcastGameState({
        player: { x: player.x, y: player.y, angle: player.angle, score: player.score },
      });

      // --- RENDER CANVAS ---
      ctx.fillStyle = '#0a0c16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Grid Lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Render Powerups
      powerups.forEach((p) => {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Render Bullets
      bullets.forEach((b) => {
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Render Bots
      bots.forEach((bot) => {
        if (bot.hp <= 0) return;
        ctx.save();
        ctx.translate(bot.x, bot.y);
        ctx.rotate(bot.angle);

        // Bot Ship Body
        ctx.shadowColor = bot.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = bot.color;
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(-14, -12);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-14, 12);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Bot Name & HP bar
        ctx.fillStyle = '#9ca3af';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(bot.name, bot.x, bot.y - 24);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(bot.x - 20, bot.y - 20, 40, 4);
        ctx.fillStyle = bot.color;
        ctx.fillRect(bot.x - 20, bot.y - 20, (bot.hp / bot.maxHp) * 40, 4);
      });

      // Render Player Ship
      if (player.hp > 0) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);

        ctx.shadowColor = player.color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.lineTo(-16, -14);
        ctx.lineTo(-10, 0);
        ctx.lineTo(-16, 14);
        ctx.closePath();
        ctx.fill();

        // Cockpit Glow
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(4, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Player Name & HP bar
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, player.x, player.y - 26);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(player.x - 25, player.y - 20, 50, 5);
        ctx.fillStyle = player.hp > 30 ? '#39ff14' : '#ff007f';
        ctx.fillRect(player.x - 25, player.y - 20, (player.hp / player.maxHp) * 50, 5);
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [broadcastGameState, recordHighScore, addXp, addCoins]);

  const resetGame = () => {
    gameStateRef.current.player.hp = 100;
    gameStateRef.current.player.score = 0;
    gameStateRef.current.player.kills = 0;
    gameStateRef.current.player.x = 400;
    gameStateRef.current.player.y = 300;
    gameStateRef.current.bullets = [];
    gameStateRef.current.powerups = [];

    const colors = ['#ff007f', '#39ff14', '#ffee00', '#9d4edd'];
    gameStateRef.current.bots.forEach((b, i) => {
      b.hp = 80 + wave * 15;
      b.x = 100 + Math.random() * 600;
      b.y = 100 + Math.random() * 400;
      b.color = colors[i % colors.length];
    });

    setGameOver(false);
    setVictory(false);
    setScore(0);
    setKills(0);
    soundFx.playClick();
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-5xl mx-auto select-none">
      {/* Game HUD Bar */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-t-xl px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <div className="w-32 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-cyan-500 to-green-400 h-full transition-all duration-300"
                style={{ width: `${Math.max(0, gameStateRef.current.player.hp)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-cyan-400">{Math.max(0, gameStateRef.current.player.hp)} HP</span>
          </div>

          <div className="flex items-center gap-2 text-yellow-400 font-bold">
            <Trophy className="w-4 h-4" />
            <span>Score: {score}</span>
          </div>

          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <Crosshair className="w-4 h-4" />
            <span>Kills: {kills}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-purple-900/80 text-purple-300 px-3 py-1 rounded-full border border-purple-500/40">
            Weapon: {gameStateRef.current.player.weapon.toUpperCase()}
          </span>
          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-600 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restart
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full aspect-[16/9] bg-slate-950 border border-slate-800 rounded-b-xl overflow-hidden shadow-2xl">
        <canvas ref={canvasRef} width={960} height={540} className="w-full h-full cursor-crosshair" />

        {/* Live Killfeed overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 pointer-events-none">
          {killFeed.map((msg, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 backdrop-blur border border-slate-700/60 text-xs text-slate-200 px-3 py-1 rounded-md shadow"
            >
              {msg}
            </div>
          ))}
        </div>

        {/* Victory Screen Modal Overlay */}
        {victory && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in z-20">
            <Trophy className="w-16 h-16 text-yellow-400 mb-3 animate-bounce" />
            <h2 className="text-4xl font-extrabold text-white tracking-wider mb-2">ARENA VICTORY!</h2>
            <p className="text-slate-300 mb-6">You dominated the cyber battlefield!</p>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-6 flex gap-6 text-center">
              <div>
                <div className="text-xs text-slate-400">Total Score</div>
                <div className="text-2xl font-bold text-yellow-400">{score}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Eliminations</div>
                <div className="text-2xl font-bold text-rose-400">{kills}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">XP Earned</div>
                <div className="text-2xl font-bold text-cyan-400">+300</div>
              </div>
            </div>
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-cyan-500/30 transition transform hover:scale-105"
            >
              PLAY NEXT ROUND
            </button>
          </div>
        )}

        {/* Game Over Screen Modal Overlay */}
        {gameOver && !victory && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <h2 className="text-4xl font-extrabold text-rose-500 tracking-wider mb-2">SHIP ELIMINATED</h2>
            <p className="text-slate-400 mb-6">Your cyber hull was destroyed in combat.</p>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex gap-6 text-center">
              <div>
                <div className="text-xs text-slate-400">Final Score</div>
                <div className="text-2xl font-bold text-slate-200">{score}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Kills</div>
                <div className="text-2xl font-bold text-rose-400">{kills}</div>
              </div>
            </div>
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform hover:scale-105"
            >
              RESPAWN
            </button>
          </div>
        )}
      </div>

      {/* Control Info Footer */}
      <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
        <div>Controls: WASD / Arrows to Move • Mouse to Aim • Space / Click to Shoot • Shift for Turbo Dash</div>
        <div className="text-cyan-400 font-semibold">Tip: Destroy glowing nodes for Triple Laser & Plasma cannons!</div>
      </div>
    </div>
  );
};
