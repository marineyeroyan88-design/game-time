import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { Trophy, RefreshCw, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

const COLS = 10;
const ROWS = 20;

const TETROMINOES = {
  I: { shape: [[1, 1, 1, 1]], color: '#00f0ff' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0070ff' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#ff7700' },
  O: { shape: [[1, 1], [1, 1]], color: '#ffee00' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#39ff14' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#9d4edd' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#ff007f' },
};

export const BlockRushGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { recordHighScore, addXp, addCoins } = useGame();

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [opponentGarbage, setOpponentGarbage] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const boardRef = useRef<string[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(''))
  );

  const activePieceRef = useRef({
    type: 'I' as keyof typeof TETROMINOES,
    shape: TETROMINOES.I.shape,
    color: TETROMINOES.I.color,
    x: 3,
    y: 0,
  });

  const getRandomPiece = () => {
    const keys = Object.keys(TETROMINOES) as (keyof typeof TETROMINOES)[];
    const key = keys[Math.floor(Math.random() * keys.length)];
    return {
      type: key,
      shape: TETROMINOES[key].shape,
      color: TETROMINOES[key].color,
      x: 3,
      y: 0,
    };
  };

  const checkCollision = (piece: typeof activePieceRef.current, offsetX = 0, offsetY = 0, newShape?: number[][]) => {
    const shape = newShape || piece.shape;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = piece.x + c + offsetX;
          const newY = piece.y + r + offsetY;

          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (newY >= 0 && boardRef.current[newY][newX] !== '') return true;
        }
      }
    }
    return false;
  };

  const mergePiece = () => {
    const piece = activePieceRef.current;
    piece.shape.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val) {
          const boardY = piece.y + r;
          const boardX = piece.x + c;
          if (boardY >= 0 && boardY < ROWS) {
            boardRef.current[boardY][boardX] = piece.color;
          }
        }
      });
    });

    // Check full lines
    let linesCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (boardRef.current[r].every((cell) => cell !== '')) {
        boardRef.current.splice(r, 1);
        boardRef.current.unshift(Array(COLS).fill(''));
        linesCleared++;
        r++; // check same index again after shift
      }
    }

    if (linesCleared > 0) {
      soundFx.playCoin();
      const bonus = [0, 100, 300, 500, 800][linesCleared] || 1000;
      setScore((prev) => {
        const newScore = prev + bonus;
        recordHighScore('block-rush', newScore);
        return newScore;
      });
      setLines((prev) => prev + linesCleared);

      // Simulated Garbage Attack back to opponent
      setOpponentGarbage((prev) => prev + linesCleared);
      if (linesCleared >= 4) {
        confetti({ particleCount: 80, spread: 60 });
        soundFx.playVictory();
      }
    } else {
      soundFx.playHit();
    }

    // Spawn new piece
    activePieceRef.current = getRandomPiece();

    // Game Over check
    if (checkCollision(activePieceRef.current)) {
      setGameOver(true);
      soundFx.playDefeat();
      addXp(150);
      addCoins(100);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      const piece = activePieceRef.current;

      if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (!checkCollision(piece, -1, 0)) piece.x -= 1;
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        if (!checkCollision(piece, 1, 0)) piece.x += 1;
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        if (!checkCollision(piece, 0, 1)) piece.y += 1;
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        // Rotate
        const rotated = piece.shape[0].map((_, i) => piece.shape.map((row) => row[i]).reverse());
        if (!checkCollision(piece, 0, 0, rotated)) {
          piece.shape = rotated;
          soundFx.playClick();
        }
      } else if (e.key === ' ') {
        // Hard Drop
        while (!checkCollision(piece, 0, 1)) {
          piece.y += 1;
        }
        mergePiece();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  // Tick loop
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      const piece = activePieceRef.current;
      if (!checkCollision(piece, 0, 1)) {
        piece.y += 1;
      } else {
        mergePiece();
      }
    }, 700);

    return () => clearInterval(interval);
  }, [gameOver]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.fillStyle = '#080a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cellSize = 25;
      const startX = (canvas.width - COLS * cellSize) / 2;
      const startY = 20;

      // Draw Grid Frame
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(startX, startY, COLS * cellSize, ROWS * cellSize);

      // Draw Board Cells
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const color = boardRef.current[r][c];
          if (color) {
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.fillRect(startX + c * cellSize + 1, startY + r * cellSize + 1, cellSize - 2, cellSize - 2);
            ctx.shadowBlur = 0;
          }
        }
      }

      // Draw Active Falling Piece
      const piece = activePieceRef.current;
      piece.shape.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val) {
            const px = startX + (piece.x + c) * cellSize;
            const py = startY + (piece.y + r) * cellSize;
            ctx.fillStyle = piece.color;
            ctx.shadowColor = piece.color;
            ctx.shadowBlur = 12;
            ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
            ctx.shadowBlur = 0;
          }
        });
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameOver]);

  const restartBlockGame = () => {
    boardRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
    activePieceRef.current = getRandomPiece();
    setScore(0);
    setLines(0);
    setOpponentGarbage(0);
    setGameOver(false);
    soundFx.playClick();
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-5xl mx-auto select-none">
      {/* HUD Header */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-t-xl px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Zap className="w-5 h-5" />
            <span>Score: {score}</span>
          </div>

          <div className="flex items-center gap-2 text-yellow-400 font-bold">
            <Trophy className="w-4 h-4" />
            <span>Lines Cleared: {lines}</span>
          </div>

          <div className="text-xs bg-rose-900/80 text-rose-300 px-3 py-1 rounded-full border border-rose-500/40 font-bold">
            Garbage Attacks Sent: {opponentGarbage}
          </div>
        </div>

        <button
          onClick={restartBlockGame}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-600 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Restart Game
        </button>
      </div>

      {/* Main Canvas */}
      <div className="relative w-full aspect-[16/9] bg-slate-950 border border-slate-800 rounded-b-xl overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas ref={canvasRef} width={960} height={540} className="w-full h-full" />

        {/* Game Over Modal */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <h2 className="text-4xl font-extrabold text-rose-500 tracking-wider mb-2">BOARD OVERFLOWED!</h2>
            <p className="text-slate-300 mb-4">Blocks reached the top ceiling.</p>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex gap-6 text-center">
              <div>
                <div className="text-xs text-slate-400">Total Score</div>
                <div className="text-2xl font-bold text-cyan-400">{score}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Lines Cleared</div>
                <div className="text-2xl font-bold text-yellow-400">{lines}</div>
              </div>
            </div>
            <button
              onClick={restartBlockGame}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform hover:scale-105"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
        <div>Controls: Left / Right Arrows to Move • Up Arrow / W to Rotate • Down to Soft Drop • Space for Hard Drop</div>
        <div className="text-cyan-400 font-semibold">Tip: Clear 4 lines at once (TETRIS) to send maximum garbage!</div>
      </div>
    </div>
  );
};
