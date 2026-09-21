import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { Trophy, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CyberHockeyGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { recordHighScore, addXp, addCoins } = useGame();

  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);

  const gameStateRef = useRef({
    playerPaddle: { x: 480, y: 460, radius: 26, color: '#00f0ff' },
    opponentPaddle: { x: 480, y: 80, radius: 26, color: '#ff007f' },
    puck: { x: 480, y: 270, vx: 0, vy: 5, radius: 16, color: '#ffee00' },
    pScore: 0,
    oScore: 0,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Restrict player paddle to bottom half of air hockey table
      const p = gameStateRef.current.playerPaddle;
      p.x = Math.max(p.radius, Math.min(canvasRef.current.width - p.radius, mouseX));
      p.y = Math.max(canvasRef.current.height / 2 + p.radius, Math.min(canvasRef.current.height - p.radius, mouseY));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resetPuck = (towardsPlayer: boolean) => {
      const p = gameStateRef.current.puck;
      p.x = canvas.width / 2;
      p.y = canvas.height / 2;
      p.vx = (Math.random() - 0.5) * 6;
      p.vy = towardsPlayer ? 5 : -5;
    };

    const loop = () => {
      const state = gameStateRef.current;
      const { playerPaddle, opponentPaddle, puck } = state;

      if (!winner) {
        // Move Puck
        puck.x += puck.vx;
        puck.y += puck.vy;

        // Friction
        puck.vx *= 0.992;
        puck.vy *= 0.992;

        // Wall Bounces (Left / Right)
        if (puck.x - puck.radius < 20 || puck.x + puck.radius > canvas.width - 20) {
          puck.vx *= -1;
          soundFx.playHit();
          puck.x = puck.x - puck.radius < 20 ? 20 + puck.radius : canvas.width - 20 - puck.radius;
        }

        // Goals (Top / Bottom)
        const goalWidth = 240;
        const goalLeft = (canvas.width - goalWidth) / 2;
        const goalRight = goalLeft + goalWidth;

        // Top Goal (Player Scores!)
        if (puck.y - puck.radius <= 10) {
          if (puck.x >= goalLeft && puck.x <= goalRight) {
            state.pScore += 1;
            setPlayerScore(state.pScore);
            soundFx.playVictory();

            if (state.pScore >= 7) {
              setWinner('player');
              confetti({ particleCount: 100, spread: 70 });
              recordHighScore('cyber-hockey', state.pScore);
              addXp(250);
              addCoins(200);
            } else {
              resetPuck(false);
            }
          } else {
            puck.vy *= -1;
            puck.y = 10 + puck.radius;
            soundFx.playHit();
          }
        }

        // Bottom Goal (Opponent Scores!)
        if (puck.y + puck.radius >= canvas.height - 10) {
          if (puck.x >= goalLeft && puck.x <= goalRight) {
            state.oScore += 1;
            setOpponentScore(state.oScore);
            soundFx.playDefeat();

            if (state.oScore >= 7) {
              setWinner('opponent');
            } else {
              resetPuck(true);
            }
          } else {
            puck.vy *= -1;
            puck.y = canvas.height - 10 - puck.radius;
            soundFx.playHit();
          }
        }

        // Opponent AI Paddle Movement
        const targetX = puck.x;
        opponentPaddle.x += (targetX - opponentPaddle.x) * 0.1;
        opponentPaddle.x = Math.max(
          opponentPaddle.radius,
          Math.min(canvas.width - opponentPaddle.radius, opponentPaddle.x)
        );

        // Paddle Collision: Player
        const pDist = Math.hypot(puck.x - playerPaddle.x, puck.y - playerPaddle.y);
        if (pDist < puck.radius + playerPaddle.radius) {
          const angle = Math.atan2(puck.y - playerPaddle.y, puck.x - playerPaddle.x);
          const force = 12;
          puck.vx = Math.cos(angle) * force;
          puck.vy = Math.sin(angle) * force;
          soundFx.playShoot();
        }

        // Paddle Collision: Opponent
        const oDist = Math.hypot(puck.x - opponentPaddle.x, puck.y - opponentPaddle.y);
        if (oDist < puck.radius + opponentPaddle.radius) {
          const angle = Math.atan2(puck.y - opponentPaddle.y, puck.x - opponentPaddle.x);
          const force = 12;
          puck.vx = Math.cos(angle) * force;
          puck.vy = Math.sin(angle) * force;
          soundFx.playShoot();
        }
      }

      // --- CANVAS RENDERING ---
      ctx.fillStyle = '#0a0d18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Hockey Table Lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 10, canvas.width - 40, canvas.height - 20);

      // Center Line & Circle
      ctx.beginPath();
      ctx.moveTo(20, canvas.height / 2);
      ctx.lineTo(canvas.width - 20, canvas.height / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 70, 0, Math.PI * 2);
      ctx.stroke();

      // Goal Nets
      const goalW = 240;
      ctx.fillStyle = 'rgba(255, 0, 127, 0.3)';
      ctx.fillRect((canvas.width - goalW) / 2, 5, goalW, 10);

      ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.fillRect((canvas.width - goalW) / 2, canvas.height - 15, goalW, 10);

      // Player Paddle
      ctx.fillStyle = playerPaddle.color;
      ctx.shadowColor = playerPaddle.color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(playerPaddle.x, playerPaddle.y, playerPaddle.radius, 0, Math.PI * 2);
      ctx.fill();

      // Opponent Paddle
      ctx.fillStyle = opponentPaddle.color;
      ctx.shadowColor = opponentPaddle.color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(opponentPaddle.x, opponentPaddle.y, opponentPaddle.radius, 0, Math.PI * 2);
      ctx.fill();

      // Puck
      ctx.fillStyle = puck.color;
      ctx.shadowColor = puck.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [winner, addCoins, addXp, recordHighScore]);

  const resetMatch = () => {
    gameStateRef.current.pScore = 0;
    gameStateRef.current.oScore = 0;
    gameStateRef.current.puck.x = 480;
    gameStateRef.current.puck.y = 270;
    gameStateRef.current.puck.vx = 0;
    gameStateRef.current.puck.vy = 5;
    setPlayerScore(0);
    setOpponentScore(0);
    setWinner(null);
    soundFx.playClick();
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-5xl mx-auto select-none">
      {/* Score HUD */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-t-xl px-6 py-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="text-xs text-rose-400 font-bold">OPPONENT:</span>
            <span className="text-2xl font-extrabold text-rose-400">{opponentScore}</span>
          </div>

          <div className="text-slate-500 font-bold">VS</div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-cyan-400">{playerScore}</span>
            <span className="text-xs text-cyan-400 font-bold">:YOU</span>
          </div>
        </div>

        <button
          onClick={resetMatch}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-600 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Restart Match
        </button>
      </div>

      {/* Canvas */}
      <div className="relative w-full aspect-[16/9] bg-slate-950 border border-slate-800 rounded-b-xl overflow-hidden shadow-2xl">
        <canvas ref={canvasRef} width={960} height={540} className="w-full h-full cursor-none" />

        {/* Winner Screen */}
        {winner && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-20">
            {winner === 'player' ? (
              <>
                <Trophy className="w-16 h-16 text-yellow-400 mb-2 animate-bounce" />
                <h2 className="text-4xl font-extrabold text-cyan-400 tracking-wider mb-2">HOCKEY CHAMPION!</h2>
                <p className="text-slate-300 mb-6">First to 7 goals scored!</p>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-extrabold text-rose-500 tracking-wider mb-2">MATCH DEFEAT</h2>
                <p className="text-slate-400 mb-6">Opponent scored 7 goals first.</p>
              </>
            )}
            <button
              onClick={resetMatch}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform hover:scale-105"
            >
              REMATCH
            </button>
          </div>
        )}
      </div>

      <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
        <div>Controls: Move mouse to control bottom paddle • First to 7 goals wins</div>
        <div className="text-cyan-400 font-semibold">Tip: Hit puck on the edge of your paddle for maximum velocity angle!</div>
      </div>
    </div>
  );
};
