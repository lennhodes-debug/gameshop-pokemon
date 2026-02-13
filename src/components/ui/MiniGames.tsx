'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ──────────────────────────────────────────────────
type GameId = 'menu' | 'memory' | 'snake' | 'whack' | 'speed' | 'racer' | 'darts';

interface HighScores {
  memory: number;
  snake: number;
  whack: number;
  speed: number;
  racer: number;
  darts: number;
}

const STORAGE_KEY = 'gameshop-minigames';

function loadScores(): HighScores {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : { memory: 0, snake: 0, whack: 0, speed: 0, racer: 0, darts: 0 };
  } catch { return { memory: 0, snake: 0, whack: 0, speed: 0, racer: 0, darts: 0 }; }
}

function saveScore(game: keyof HighScores, score: number) {
  const scores = loadScores();
  if (score > scores[game]) {
    scores[game] = score;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(scores)); } catch {}
  }
  return scores;
}

// ─── Confetti burst ──────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 200,
    y: -(Math.random() * 150 + 50),
    r: Math.random() * 360,
    color: ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#0ea5e9', '#ec4899'][i % 6],
    size: 4 + Math.random() * 4,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, background: p.color, left: '50%', top: '60%' }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, rotate: p.r, opacity: 0 }}
          transition={{ duration: 0.8 + Math.random() * 0.4, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ─── Animated score popup ────────────────────────────────────
function ScorePopup({ score, show }: { score: number; show: boolean }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: [1, 1, 0], y: -40, scale: [1.2, 1, 0.8] }}
      transition={{ duration: 0.8 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 pointer-events-none z-50 text-emerald-400 font-bold text-lg"
    >
      +{score}
    </motion.div>
  );
}

// ─── Game character SVGs ─────────────────────────────────────
function GameBear({ size = 40, mood = 'happy' }: { size?: number; mood?: 'happy' | 'sad' | 'excited' | 'thinking' | 'playing' }) {
  const mouthPaths: Record<string, string> = {
    happy: 'M14 20 Q17 24 20 20',
    sad: 'M14 22 Q17 19 20 22',
    excited: 'M13 19 Q17 25 21 19 Z',
    thinking: 'M15 21 L19 21',
    playing: 'M13 20 Q17 23 21 20',
  };
  const eyeScale = mood === 'excited' ? 1.3 : mood === 'sad' ? 0.8 : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <circle cx="17" cy="18" r="14" fill="#8B6914" />
      <circle cx="17" cy="18" r="12" fill="#C4943D" />
      {/* Ears with inner detail */}
      <circle cx="7" cy="10" r="5" fill="#8B6914" />
      <circle cx="7" cy="10" r="3.5" fill="#D4A76A" />
      <circle cx="7" cy="10" r="2" fill="#E8C088" />
      <circle cx="27" cy="10" r="5" fill="#8B6914" />
      <circle cx="27" cy="10" r="3.5" fill="#D4A76A" />
      <circle cx="27" cy="10" r="2" fill="#E8C088" />
      {/* Blush cheeks */}
      <ellipse cx="10" cy="20" rx="2.5" ry="1.5" fill="rgba(255,150,150,0.25)" />
      <ellipse cx="24" cy="20" rx="2.5" ry="1.5" fill="rgba(255,150,150,0.25)" />
      {/* Eyes with animation size */}
      <circle cx="13" cy="16" r={2 * eyeScale} fill="#2D1B00" />
      <circle cx="21" cy="16" r={2 * eyeScale} fill="#2D1B00" />
      <circle cx="13.5" cy="15.3" r={0.7 * eyeScale} fill="white" />
      <circle cx="21.5" cy="15.3" r={0.7 * eyeScale} fill="white" />
      {/* Mouth */}
      <path d={mouthPaths[mood]} stroke="#2D1B00" strokeWidth="1.5" strokeLinecap="round" fill={mood === 'excited' ? '#2D1B00' : 'none'} />
      {/* Nose */}
      <ellipse cx="17" cy="18" rx="2.5" ry="2" fill="#D4A76A" />
      <circle cx="17" cy="17.5" r="1.2" fill="#2D1B00" />
      {/* Controller accessory for playing mood */}
      {mood === 'playing' && (
        <g transform="translate(22, 24) scale(0.4)">
          <rect x="0" y="0" width="20" height="12" rx="3" fill="#334155" />
          <circle cx="6" cy="6" r="2" fill="#10b981" />
          <circle cx="14" cy="6" r="2" fill="#ef4444" />
        </g>
      )}
    </svg>
  );
}

function Mushroom({ size = 24, color = '#ef4444' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="10" rx="10" ry="8" fill={color} />
      <circle cx="8" cy="8" r="2.5" fill="white" opacity="0.8" />
      <circle cx="16" cy="7" r="2" fill="white" opacity="0.8" />
      <circle cx="12" cy="12" r="1.5" fill="white" opacity="0.6" />
      <rect x="9" y="16" width="6" height="6" rx="1" fill="#F5E6C8" />
      <ellipse cx="12" cy="16" rx="5" ry="2" fill={color} opacity="0.3" />
      <circle cx="9.5" cy="14" r="1" fill="#2D1B00" />
      <circle cx="14.5" cy="14" r="1" fill="#2D1B00" />
      <path d="M11 15.5 Q12 16.5 13 15.5" stroke="#2D1B00" strokeWidth="0.7" fill="none" />
    </svg>
  );
}

function Star({ size = 24, color = '#f59e0b' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2 L14.5 8.5 L21.5 9.2 L16 14 L17.5 21 L12 17.5 L6.5 21 L8 14 L2.5 9.2 L9.5 8.5 Z" fill={color} />
      <circle cx="10" cy="12" r="1" fill="#2D1B00" />
      <circle cx="14" cy="12" r="1" fill="#2D1B00" />
      <path d="M10.5 14 Q12 15.5 13.5 14" stroke="#2D1B00" strokeWidth="0.8" fill="none" />
      <circle cx="10.5" cy="11.5" r="0.4" fill="white" />
      <circle cx="14.5" cy="11.5" r="0.4" fill="white" />
    </svg>
  );
}

function Ghost({ size = 24, color = '#8b5cf6' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 22 V10 C4 5 8 2 12 2 C16 2 20 5 20 10 V22 L17 19 L14 22 L12 20 L10 22 L7 19 Z" fill={color} />
      <circle cx="9" cy="11" r="2.5" fill="white" />
      <circle cx="15" cy="11" r="2.5" fill="white" />
      <circle cx="9.8" cy="11.5" r="1.2" fill="#2D1B00" />
      <circle cx="15.8" cy="11.5" r="1.2" fill="#2D1B00" />
      <ellipse cx="12" cy="16" rx="1.5" ry="1" fill="#2D1B00" />
    </svg>
  );
}

function Coin({ size = 24, color = '#f59e0b' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill={color} />
      <circle cx="12" cy="12" r="8" fill="#fbbf24" />
      <circle cx="12" cy="12" r="7" fill={color} opacity="0.3" />
      <text x="12" y="16" textAnchor="middle" fill="#92400e" fontSize="10" fontWeight="bold">G</text>
    </svg>
  );
}

function Heart({ size = 24, color = '#ef4444' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 21 C12 21 3 14 3 8.5 C3 5 6 3 8.5 3 C10 3 11.5 4 12 5 C12.5 4 14 3 15.5 3 C18 3 21 5 21 8.5 C21 14 12 21 12 21Z" fill={color} />
      <ellipse cx="8" cy="9" rx="2" ry="2.5" fill="white" opacity="0.3" />
    </svg>
  );
}

function Kart({ size = 24, color = '#ef4444' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Body */}
      <rect x="6" y="8" width="12" height="10" rx="3" fill={color} />
      <rect x="7" y="6" width="10" height="6" rx="2" fill={color} opacity="0.7" />
      {/* Windshield */}
      <rect x="8.5" y="6.5" width="7" height="4" rx="1.5" fill="#0ea5e9" opacity="0.6" />
      {/* Wheels */}
      <rect x="4" y="10" width="3" height="5" rx="1.5" fill="#1e293b" />
      <rect x="17" y="10" width="3" height="5" rx="1.5" fill="#1e293b" />
      <rect x="4.5" y="11" width="2" height="1" rx="0.5" fill="#94a3b8" />
      <rect x="17.5" y="11" width="2" height="1" rx="0.5" fill="#94a3b8" />
      {/* Driver head */}
      <circle cx="12" cy="7" r="2" fill="#fbbf24" />
      <circle cx="11.3" cy="6.5" r="0.4" fill="#2D1B00" />
      <circle cx="12.7" cy="6.5" r="0.4" fill="#2D1B00" />
      {/* Racing stripe */}
      <rect x="10.5" y="9" width="3" height="8" rx="1" fill="white" opacity="0.3" />
      {/* Exhaust */}
      <circle cx="12" cy="19" r="1" fill="#94a3b8" opacity="0.5" />
    </svg>
  );
}

function Dartboard({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#1e293b" />
      <circle cx="12" cy="12" r="10" fill="#ef4444" />
      <circle cx="12" cy="12" r="7.5" fill="#10b981" />
      <circle cx="12" cy="12" r="5" fill="#ef4444" />
      <circle cx="12" cy="12" r="2.5" fill="#10b981" />
      <circle cx="12" cy="12" r="1" fill="#fbbf24" />
      {/* Cross lines */}
      <line x1="12" y1="1" x2="12" y2="23" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
      <line x1="1" y1="12" x2="23" y2="12" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
      {/* Dart */}
      <g transform="translate(14, 8) rotate(25)">
        <rect x="0" y="0" width="2" height="8" rx="1" fill="#f59e0b" />
        <polygon points="1,-2 -1,1 3,1" fill="#94a3b8" />
        <rect x="-1" y="6" width="4" height="2" rx="0.5" fill="#8b5cf6" opacity="0.7" />
      </g>
    </svg>
  );
}

// ─── Game character pairs for Memory ─────────────────────────
const MEMORY_CHARACTERS = [
  { id: 'bear', render: (s: number) => <GameBear size={s} mood="happy" /> },
  { id: 'mushroom', render: (s: number) => <Mushroom size={s} color="#ef4444" /> },
  { id: 'star', render: (s: number) => <Star size={s} color="#f59e0b" /> },
  { id: 'ghost', render: (s: number) => <Ghost size={s} color="#8b5cf6" /> },
  { id: 'coin', render: (s: number) => <Coin size={s} color="#f59e0b" /> },
  { id: 'heart', render: (s: number) => <Heart size={s} color="#ef4444" /> },
  { id: 'mushroom2', render: (s: number) => <Mushroom size={s} color="#10b981" /> },
  { id: 'ghost2', render: (s: number) => <Ghost size={s} color="#0ea5e9" /> },
];

// ═══════════════════════════════════════════════════════════════
// GAME 1: Memory Match — met game characters
// ═══════════════════════════════════════════════════════════════
function MemoryGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const [cards, setCards] = useState<{ id: number; charIdx: number; flipped: boolean; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(0);
  const [started, setStarted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastMatch, setLastMatch] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const initGame = useCallback(() => {
    const indices = Array.from({ length: 8 }, (_, i) => i);
    const deck = [...indices, ...indices]
      .map((charIdx, i) => ({ id: i, charIdx, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);
    setCards(deck);
    setSelected([]);
    setMoves(0);
    setMatches(0);
    setGameOver(false);
    setTimer(0);
    setStarted(false);
    setShowConfetti(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => { initGame(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [initGame]);

  useEffect(() => {
    if (matches === 8 && !gameOver) {
      setGameOver(true);
      setShowConfetti(true);
      if (timerRef.current) clearInterval(timerRef.current);
      const score = Math.max(0, 1000 - moves * 20 - timer * 2);
      onScore(score);
    }
  }, [matches, gameOver, moves, timer, onScore]);

  const handleClick = (idx: number) => {
    if (selected.length >= 2 || cards[idx].flipped || cards[idx].matched || gameOver) return;
    if (!started) {
      setStarted(true);
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);
    const newSel = [...selected, idx];
    setSelected(newSel);
    if (newSel.length === 2) {
      setMoves(m => m + 1);
      if (newCards[newSel[0]].charIdx === newCards[newSel[1]].charIdx) {
        setLastMatch(newSel[0]);
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => newSel.includes(i) ? { ...c, matched: true } : c));
          setSelected([]);
          setMatches(m => m + 1);
          setLastMatch(null);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => newSel.includes(i) ? { ...c, flipped: false } : c));
          setSelected([]);
        }, 900);
      }
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      <Confetti active={showConfetti} />
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-amber-400 font-medium">{moves} zetten</span>
          <span className="text-emerald-400 font-medium">{timer}s</span>
          <span className="text-cyan-400 font-medium">{matches}/8</span>
        </div>
      </div>

      {gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.6 }}>
            <GameBear size={64} mood="excited" />
          </motion.div>
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-white font-bold text-xl">Gewonnen!</motion.p>
          <p className="text-slate-400 text-sm">{moves} zetten in {timer}s</p>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-emerald-400 font-bold text-3xl"
          >
            {Math.max(0, 1000 - moves * 20 - timer * 2)} pts
          </motion.p>
          <button onClick={initGame} className="mt-3 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20">
            Opnieuw spelen
          </button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center px-3 pb-3">
          <div className="grid grid-cols-4 gap-2 w-full max-w-[280px]">
            {cards.map((card, i) => {
              const isRevealed = card.flipped || card.matched;
              return (
                <motion.button
                  key={card.id}
                  onClick={() => handleClick(i)}
                  className="aspect-square rounded-xl flex items-center justify-center select-none relative overflow-hidden"
                  style={{
                    background: card.matched
                      ? 'rgba(16,185,129,0.15)'
                      : isRevealed
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(255,255,255,0.04)',
                  }}
                  whileHover={!isRevealed ? { scale: 1.05, background: 'rgba(255,255,255,0.07)' } : {}}
                  whileTap={!isRevealed ? { scale: 0.95 } : {}}
                  animate={{
                    rotateY: isRevealed ? 0 : 180,
                    borderColor: card.matched ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.06)',
                  }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                >
                  {isRevealed ? (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {MEMORY_CHARACTERS[card.charIdx].render(28)}
                    </motion.div>
                  ) : (
                    <span className="text-white/10 text-lg font-bold">?</span>
                  )}
                  {lastMatch === i && <ScorePopup score={50} show />}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME 2: Snake — met game thema
// ═══════════════════════════════════════════════════════════════
const GRID = 15;
type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

function SnakeGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const [snake, setSnake] = useState<number[][]>([[7, 7], [7, 8], [7, 9]]);
  const [food, setFood] = useState<number[]>([3, 3]);
  const [dir, setDir] = useState<Dir>('UP');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [showHitEffect, setShowHitEffect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [ateFood, setAteFood] = useState(false);
  const dirRef = useRef<Dir>('UP');
  const gameRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const spawnFood = useCallback((snk: number[][]) => {
    let pos: number[];
    do {
      pos = [Math.floor(Math.random() * GRID), Math.floor(Math.random() * GRID)];
    } while (snk.some(s => s[0] === pos[0] && s[1] === pos[1]));
    return pos;
  }, []);

  const resetGame = useCallback(() => {
    const initial = [[7, 7], [7, 8], [7, 9]];
    setSnake(initial);
    setFood(spawnFood(initial));
    setDir('UP');
    dirRef.current = 'UP';
    setGameOver(false);
    setScore(0);
    setStarted(false);
    setShowHitEffect(false);
    setShowConfetti(false);
    if (gameRef.current) clearInterval(gameRef.current);
  }, [spawnFood]);

  useEffect(() => { resetGame(); return () => { if (gameRef.current) clearInterval(gameRef.current); }; }, [resetGame]);

  const tick = useCallback(() => {
    setSnake(prev => {
      const d = dirRef.current;
      const head = [...prev[0]];
      if (d === 'UP') head[0]--;
      else if (d === 'DOWN') head[0]++;
      else if (d === 'LEFT') head[1]--;
      else head[1]++;

      if (head[0] < 0 || head[0] >= GRID || head[1] < 0 || head[1] >= GRID ||
          prev.some(s => s[0] === head[0] && s[1] === head[1])) {
        setGameOver(true);
        setShowHitEffect(true);
        if (gameRef.current) clearInterval(gameRef.current);
        return prev;
      }

      const newSnake = [head, ...prev];
      setFood(f => {
        if (head[0] === f[0] && head[1] === f[1]) {
          setScore(s => s + 10);
          setAteFood(true);
          setTimeout(() => setAteFood(false), 300);
          setTimeout(() => setFood(spawnFood(newSnake)), 0);
          return f;
        }
        newSnake.pop();
        return f;
      });
      return newSnake;
    });
  }, [spawnFood]);

  useEffect(() => {
    if (gameOver) {
      onScore(score);
      if (score >= 50) setShowConfetti(true);
      return;
    }
    if (!started) return;
    const speed = Math.max(80, 160 - score * 2);
    gameRef.current = setInterval(tick, speed);
    return () => { if (gameRef.current) clearInterval(gameRef.current); };
  }, [started, gameOver, tick, score, onScore]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
        w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
      };
      const newDir = map[e.key];
      if (!newDir) return;
      e.preventDefault();
      const opp: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
      if (newDir !== opp[dirRef.current]) {
        dirRef.current = newDir;
        setDir(newDir);
        if (!started) setStarted(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [started]);

  const touchRef = useRef<{ x: number; y: number } | null>(null);

  // Color gradient for snake body segments
  const getSnakeColor = (idx: number, total: number) => {
    if (idx === 0) return '#10b981'; // Head
    const ratio = idx / total;
    const r = Math.round(16 + ratio * 10);
    const g = Math.round(185 - ratio * 50);
    const b = Math.round(129 - ratio * 40);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div className="relative flex flex-col h-full">
      <Confetti active={showConfetti} />
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-400 font-bold">{score} pts</span>
          <span className="text-amber-400">{Math.floor(snake.length - 3)} gegeten</span>
        </div>
      </div>

      {gameOver ? (
        <motion.div
          className="flex-1 flex flex-col items-center justify-center gap-3 px-4"
          initial={showHitEffect ? { x: -5 } : {}}
          animate={showHitEffect ? { x: [5, -5, 3, -3, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <GameBear size={64} mood="sad" />
          <p className="text-white font-bold text-xl">Game Over!</p>
          <p className="text-slate-400 text-sm">Snake lengte: {snake.length}</p>
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400 font-bold text-3xl">{score} pts</motion.p>
          <button onClick={resetGame} className="mt-3 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20">
            Opnieuw spelen
          </button>
        </motion.div>
      ) : (
        <div
          className="flex-1 flex flex-col items-center justify-center px-3 pb-3"
          onTouchStart={(e) => { touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
          onTouchEnd={(e) => {
            if (!touchRef.current) return;
            const dx = e.changedTouches[0].clientX - touchRef.current.x;
            const dy = e.changedTouches[0].clientY - touchRef.current.y;
            const opp: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
            let newDir: Dir;
            if (Math.abs(dx) > Math.abs(dy)) newDir = dx > 0 ? 'RIGHT' : 'LEFT';
            else newDir = dy > 0 ? 'DOWN' : 'UP';
            if (newDir !== opp[dirRef.current]) {
              dirRef.current = newDir;
              setDir(newDir);
              if (!started) setStarted(true);
            }
            touchRef.current = null;
          }}
        >
          {!started && (
            <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
              className="text-slate-500 text-xs mb-2"
            >
              Pijltjestoetsen of swipe om te starten
            </motion.p>
          )}
          <motion.div
            className="rounded-xl overflow-hidden relative"
            animate={ateFood ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.2 }}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID}, 1fr)`,
              gap: '1px',
              background: 'rgba(255,255,255,0.02)',
              width: '100%',
              maxWidth: '280px',
              aspectRatio: '1',
            }}
          >
            {Array.from({ length: GRID * GRID }).map((_, i) => {
              const row = Math.floor(i / GRID);
              const col = i % GRID;
              const snakeIdx = snake.findIndex(s => s[0] === row && s[1] === col);
              const isSnake = snakeIdx >= 0;
              const isHead = snakeIdx === 0;
              const isFood = food[0] === row && food[1] === col;
              return (
                <div
                  key={i}
                  className="aspect-square flex items-center justify-center"
                  style={{
                    background: isHead
                      ? '#10b981'
                      : isSnake
                        ? getSnakeColor(snakeIdx, snake.length)
                        : isFood
                          ? 'transparent'
                          : 'rgba(255,255,255,0.01)',
                    borderRadius: isHead ? '4px' : isSnake ? '3px' : '1px',
                    transition: 'background 0.08s',
                    boxShadow: isHead ? '0 0 6px rgba(16,185,129,0.4)' : undefined,
                  }}
                >
                  {isFood && (
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                      <Coin size={12} />
                    </motion.div>
                  )}
                  {isHead && (
                    <span className="text-[6px]" style={{ transform: `rotate(${dir === 'UP' ? 0 : dir === 'DOWN' ? 180 : dir === 'LEFT' ? 270 : 90}deg)` }}>
                      👀
                    </span>
                  )}
                </div>
              );
            })}
          </motion.div>

          {/* Mobile D-pad */}
          <div className="grid grid-cols-3 gap-1 mt-3 sm:hidden w-[120px]">
            <div />
            <button onTouchStart={() => { dirRef.current = 'UP'; setDir('UP'); if (!started) setStarted(true); }}
              className="h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 active:bg-emerald-500/30 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
            </button>
            <div />
            <button onTouchStart={() => { dirRef.current = 'LEFT'; setDir('LEFT'); if (!started) setStarted(true); }}
              className="h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 active:bg-emerald-500/30 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <button onTouchStart={() => { dirRef.current = 'DOWN'; setDir('DOWN'); if (!started) setStarted(true); }}
              className="h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 active:bg-emerald-500/30 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
            <button onTouchStart={() => { dirRef.current = 'RIGHT'; setDir('RIGHT'); if (!started) setStarted(true); }}
              className="h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 active:bg-emerald-500/30 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME 3: Whack-a-Mole — met game characters
// ═══════════════════════════════════════════════════════════════
const WHACK_CHARACTERS = [
  (s: number) => <Mushroom size={s} color="#ef4444" />,
  (s: number) => <Ghost size={s} color="#8b5cf6" />,
  (s: number) => <Star size={s} color="#f59e0b" />,
  (s: number) => <Mushroom size={s} color="#10b981" />,
  (s: number) => <Ghost size={s} color="#0ea5e9" />,
  (s: number) => <Star size={s} color="#ec4899" />,
  (s: number) => <Coin size={s} />,
  (s: number) => <Heart size={s} />,
  (s: number) => <Mushroom size={s} color="#f97316" />,
];

function WhackGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const [holes, setHoles] = useState<boolean[]>(Array(9).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lastHit, setLastHit] = useState<number | null>(null);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const holeTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastHitTime = useRef(0);

  const clearTimers = () => {
    holeTimers.current.forEach(clearTimeout);
    holeTimers.current = [];
  };

  const popMole = useCallback(() => {
    const idx = Math.floor(Math.random() * 9);
    setHoles(prev => {
      const n = [...prev];
      n[idx] = true;
      return n;
    });
    const hideDelay = Math.max(350, 1100 - score * 12);
    const timer = setTimeout(() => {
      setHoles(prev => {
        const n = [...prev];
        n[idx] = false;
        return n;
      });
    }, hideDelay);
    holeTimers.current.push(timer);
  }, [score]);

  const startGame = () => {
    setStarted(true);
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setHoles(Array(9).fill(false));
    setCombo(0);
    setShowConfetti(false);
    clearTimers();
  };

  useEffect(() => {
    if (!started || gameOver) return;
    const spawnRate = Math.max(250, 750 - score * 8);
    const spawner = setInterval(popMole, spawnRate);
    return () => clearInterval(spawner);
  }, [started, gameOver, popMole, score]);

  useEffect(() => {
    if (!started || gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          clearTimers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, gameOver]);

  useEffect(() => {
    if (gameOver && started) {
      onScore(score);
      if (score >= 15) setShowConfetti(true);
    }
  }, [gameOver, started, score, onScore]);

  const whack = (idx: number) => {
    if (!holes[idx] || gameOver) return;
    const now = Date.now();
    const timeDiff = now - lastHitTime.current;
    lastHitTime.current = now;

    setHoles(prev => {
      const n = [...prev];
      n[idx] = false;
      return n;
    });
    setScore(s => s + 1);
    setLastHit(idx);
    setTimeout(() => setLastHit(null), 400);

    // Combo system
    if (timeDiff < 800) {
      setCombo(c => {
        const newCombo = c + 1;
        if (newCombo >= 3) {
          setShowCombo(true);
          setTimeout(() => setShowCombo(false), 800);
          setScore(s => s + newCombo);
        }
        return newCombo;
      });
    } else {
      setCombo(1);
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      <Confetti active={showConfetti} />
      {showCombo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50 text-amber-400 font-black text-2xl pointer-events-none"
        >
          COMBO x{combo}!
        </motion.div>
      )}
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-400 font-bold">{score} hits</span>
          {combo >= 3 && <span className="text-amber-400 font-bold animate-pulse">x{combo}</span>}
          <span className={`font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>{timeLeft}s</span>
        </div>
      </div>

      {/* Timer bar */}
      {started && !gameOver && (
        <div className="h-1 mx-3 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: timeLeft > 10 ? '#10b981' : timeLeft > 5 ? '#f59e0b' : '#ef4444',
              width: `${(timeLeft / 30) * 100}%`,
              transition: 'width 1s linear, background 0.3s',
            }}
          />
        </div>
      )}

      {!started || gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <motion.div animate={gameOver ? { rotate: [0, 10, -10, 0] } : { y: [0, -5, 0] }} transition={{ duration: 1, repeat: gameOver ? 0 : Infinity }}>
            <GameBear size={64} mood={gameOver ? 'excited' : 'playing'} />
          </motion.div>
          {gameOver ? (
            <>
              <p className="text-white font-bold text-xl">Tijd voorbij!</p>
              <p className="text-slate-400 text-sm">Max combo: x{combo}</p>
              <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400 font-bold text-3xl">{score} hits</motion.p>
            </>
          ) : (
            <>
              <p className="text-white font-bold text-xl">Whack-a-Mole</p>
              <p className="text-slate-400 text-xs text-center">Tik op de figuurtjes! Snelle hits geven combo bonus!</p>
            </>
          )}
          <button onClick={startGame} className="mt-3 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20">
            {gameOver ? 'Opnieuw spelen' : 'Start!'}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center px-3 pb-3">
          <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
            {holes.map((active, i) => (
              <motion.button
                key={i}
                onClick={() => whack(i)}
                className="aspect-square rounded-2xl flex items-center justify-center select-none relative overflow-hidden"
                style={{
                  background: lastHit === i
                    ? 'rgba(16,185,129,0.25)'
                    : active
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(255,255,255,0.02)',
                }}
                animate={{
                  scale: active ? 1 : 0.9,
                }}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ scale: 0, y: 20, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0, y: -10, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    >
                      {WHACK_CHARACTERS[i](36)}
                    </motion.div>
                  )}
                </AnimatePresence>
                {!active && (
                  <div className="w-8 h-2 rounded-full bg-white/5" />
                )}
                {lastHit === i && <ScorePopup score={combo >= 3 ? combo : 1} show />}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME 4: Speed Click — met targets als characters
// ═══════════════════════════════════════════════════════════════
const TARGET_CHARACTERS = [
  (s: number) => <Mushroom size={s} color="#ef4444" />,
  (s: number) => <Star size={s} color="#f59e0b" />,
  (s: number) => <Ghost size={s} color="#8b5cf6" />,
  (s: number) => <Heart size={s} color="#ec4899" />,
  (s: number) => <Coin size={s} />,
  (s: number) => <Mushroom size={s} color="#10b981" />,
  (s: number) => <Ghost size={s} color="#0ea5e9" />,
];

function SpeedGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const [targets, setTargets] = useState(0);
  const [maxTargets] = useState(20);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [targetSize, setTargetSize] = useState(48);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hitEffects, setHitEffects] = useState<{ x: number; y: number; id: number }[]>([]);

  const spawnTarget = useCallback(() => {
    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 80;
    setPos({ x, y });
    setTargetSize(Math.max(28, 48 - targets * 1));
  }, [targets]);

  const startGame = () => {
    setTargets(0);
    setStarted(true);
    setGameOver(false);
    setStartTime(Date.now());
    setTargetSize(48);
    setShowConfetti(false);
    setHitEffects([]);
    spawnTarget();
  };

  const hitTarget = () => {
    // Hit effect at current position
    setHitEffects(prev => [...prev, { x: pos.x, y: pos.y, id: Date.now() }]);
    setTimeout(() => setHitEffects(prev => prev.slice(1)), 600);

    const newCount = targets + 1;
    setTargets(newCount);
    if (newCount >= maxTargets) {
      const elapsed = (Date.now() - startTime) / 1000;
      setTotalTime(elapsed);
      setGameOver(true);
      setStarted(false);
      const sc = Math.round(Math.max(0, 2000 - elapsed * 50));
      onScore(sc);
      if (sc >= 500) setShowConfetti(true);
    } else {
      spawnTarget();
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      <Confetti active={showConfetti} />
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-400 font-bold">{targets}/{maxTargets}</span>
        </div>
      </div>

      {/* Progress bar */}
      {started && (
        <div className="h-1 mx-3 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
            animate={{ width: `${(targets / maxTargets) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      )}

      {!started && !gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <GameBear size={64} mood="thinking" />
          </motion.div>
          <p className="text-white font-bold text-xl">Speed Click</p>
          <p className="text-slate-400 text-xs text-center">Vang {maxTargets} figuurtjes zo snel mogelijk!</p>
          <button onClick={startGame} className="mt-3 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-semibold hover:from-violet-400 hover:to-purple-400 transition-all shadow-lg shadow-violet-500/20">
            Start!
          </button>
        </div>
      ) : gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <motion.div animate={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 0.5 }}>
            <GameBear size={64} mood="excited" />
          </motion.div>
          <p className="text-white font-bold text-xl">Klaar!</p>
          <p className="text-slate-400 text-sm">{totalTime.toFixed(2)}s voor {maxTargets} figuurtjes</p>
          <p className="text-amber-400 text-xs font-medium">{(totalTime / maxTargets * 1000).toFixed(0)}ms gemiddeld per target</p>
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400 font-bold text-3xl">{Math.round(Math.max(0, 2000 - totalTime * 50))} pts</motion.p>
          <button onClick={startGame} className="mt-3 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-semibold hover:from-violet-400 hover:to-purple-400 transition-all shadow-lg shadow-violet-500/20">
            Opnieuw spelen
          </button>
        </div>
      ) : (
        <div className="flex-1 relative mx-3 mb-3 rounded-xl overflow-hidden cursor-crosshair" style={{ background: 'rgba(255,255,255,0.02)' }}>
          {/* Hit particles */}
          {hitEffects.map(effect => (
            <div key={effect.id} className="absolute pointer-events-none z-40" style={{ left: `${effect.x}%`, top: `${effect.y}%` }}>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ background: ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#0ea5e9', '#ec4899'][i] }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: (Math.random() - 0.5) * 60,
                    y: (Math.random() - 0.5) * 60,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{ duration: 0.5 }}
                />
              ))}
            </div>
          ))}
          <motion.button
            key={targets}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            onClick={hitTarget}
            className="absolute flex items-center justify-center active:scale-75 transition-transform"
            style={{
              width: targetSize + 12,
              height: targetSize + 12,
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {TARGET_CHARACTERS[targets % TARGET_CHARACTERS.length](targetSize)}
          </motion.button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME 5: Mini Racer — top-down Mario Kart style
// ═══════════════════════════════════════════════════════════════
const RACER_LANES = 3;
const RACER_ROWS = 12;

type RacerObstacle = { lane: number; row: number; type: 'kart' | 'banana' | 'coin'; id: number };

const OBSTACLE_COLORS = ['#ef4444', '#8b5cf6', '#f97316', '#0ea5e9', '#ec4899'];

function RacerGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const [playerLane, setPlayerLane] = useState(1);
  const [obstacles, setObstacles] = useState<RacerObstacle[]>([]);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showHitEffect, setShowHitEffect] = useState(false);
  const [speed, setSpeed] = useState(1);
  const tickRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const spawnRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const obstacleId = useRef(0);
  const gameOverRef = useRef(false);
  const playerLaneRef = useRef(1);

  const startGame = useCallback(() => {
    setPlayerLane(1);
    playerLaneRef.current = 1;
    setObstacles([]);
    setScore(0);
    setCoins(0);
    setGameOver(false);
    gameOverRef.current = false;
    setStarted(true);
    setShowConfetti(false);
    setShowHitEffect(false);
    setSpeed(1);
    obstacleId.current = 0;
  }, []);

  // Game tick - move obstacles down and check collisions
  useEffect(() => {
    if (!started || gameOver) return;

    tickRef.current = setInterval(() => {
      if (gameOverRef.current) return;

      setObstacles(prev => {
        const moved = prev.map(o => ({ ...o, row: o.row + 1 }));

        // Check collisions with player (row 10 = player position)
        const collision = moved.find(o => o.row === RACER_ROWS - 2 && o.lane === playerLaneRef.current && o.type !== 'coin');
        const coinHit = moved.find(o => o.row === RACER_ROWS - 2 && o.lane === playerLaneRef.current && o.type === 'coin');

        if (coinHit) {
          setCoins(c => c + 1);
          setScore(s => s + 25);
        }

        if (collision) {
          gameOverRef.current = true;
          setGameOver(true);
          setShowHitEffect(true);
          return prev;
        }

        // Remove off-screen, score for survived obstacles
        const surviving = moved.filter(o => o.row < RACER_ROWS);
        const passed = moved.filter(o => o.row >= RACER_ROWS && o.type !== 'coin');
        if (passed.length > 0) {
          setScore(s => s + passed.length * 10);
        }

        return surviving.filter(o => !(o.type === 'coin' && o.row === RACER_ROWS - 2 && o.lane === playerLaneRef.current));
      });

      setScore(s => s + 1);
    }, Math.max(80, 200 - speed * 5));

    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [started, gameOver, speed]);

  // Spawn obstacles
  useEffect(() => {
    if (!started || gameOver) return;

    spawnRef.current = setInterval(() => {
      if (gameOverRef.current) return;
      const lane = Math.floor(Math.random() * RACER_LANES);
      const isCoin = Math.random() < 0.3;
      const isBanana = !isCoin && Math.random() < 0.3;
      setObstacles(prev => [...prev, {
        lane,
        row: -1,
        type: isCoin ? 'coin' : isBanana ? 'banana' : 'kart',
        id: obstacleId.current++,
      }]);
    }, Math.max(400, 900 - speed * 20));

    return () => { if (spawnRef.current) clearInterval(spawnRef.current); };
  }, [started, gameOver, speed]);

  // Speed up over time
  useEffect(() => {
    if (!started || gameOver) return;
    const timer = setInterval(() => setSpeed(s => s + 1), 3000);
    return () => clearInterval(timer);
  }, [started, gameOver]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOverRef.current) return;
      if ((e.key === 'ArrowLeft' || e.key === 'a') && playerLaneRef.current > 0) {
        playerLaneRef.current--;
        setPlayerLane(playerLaneRef.current);
        if (!started) startGame();
      }
      if ((e.key === 'ArrowRight' || e.key === 'd') && playerLaneRef.current < RACER_LANES - 1) {
        playerLaneRef.current++;
        setPlayerLane(playerLaneRef.current);
        if (!started) startGame();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [started, startGame]);

  useEffect(() => {
    if (gameOver && started) {
      const finalScore = score + coins * 25;
      onScore(finalScore);
      if (finalScore >= 200) setShowConfetti(true);
    }
  }, [gameOver, started, score, coins, onScore]);

  const moveLane = (dir: -1 | 1) => {
    if (gameOverRef.current) return;
    const newLane = Math.max(0, Math.min(RACER_LANES - 1, playerLaneRef.current + dir));
    playerLaneRef.current = newLane;
    setPlayerLane(newLane);
    if (!started) startGame();
  };

  const laneWidth = 100 / RACER_LANES;

  return (
    <div className="relative flex flex-col h-full">
      <Confetti active={showConfetti} />
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-400 font-bold">{score} pts</span>
          <span className="text-amber-400 font-medium">{coins} munten</span>
          <span className="text-cyan-400">Snelheid {speed}</span>
        </div>
      </div>

      {gameOver ? (
        <motion.div
          className="flex-1 flex flex-col items-center justify-center gap-3 px-4"
          initial={showHitEffect ? { x: -5 } : {}}
          animate={showHitEffect ? { x: [5, -5, 3, -3, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <GameBear size={64} mood="sad" />
          <p className="text-white font-bold text-xl">Crash!</p>
          <p className="text-slate-400 text-sm">{coins} munten verzameld</p>
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400 font-bold text-3xl">{score} pts</motion.p>
          <button onClick={startGame} className="mt-3 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold hover:from-red-400 hover:to-orange-400 transition-all shadow-lg shadow-red-500/20">
            Opnieuw racen
          </button>
        </motion.div>
      ) : !started ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Kart size={64} color="#ef4444" />
          </motion.div>
          <p className="text-white font-bold text-xl">Mini Racer</p>
          <p className="text-slate-400 text-xs text-center">Ontwijken en munten pakken! Pijltjestoetsen of knoppen.</p>
          <button onClick={startGame} className="mt-3 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold hover:from-red-400 hover:to-orange-400 transition-all shadow-lg shadow-red-500/20">
            Start Race!
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center px-3 pb-3">
          {/* Race track */}
          <div
            className="relative w-full max-w-[260px] flex-1 rounded-xl overflow-hidden"
            style={{ background: '#1a1a2e' }}
          >
            {/* Lane dividers */}
            {Array.from({ length: RACER_LANES - 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px"
                style={{
                  left: `${((i + 1) * 100) / RACER_LANES}%`,
                  backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 12px, transparent 12px, transparent 24px)',
                  animation: 'roadScroll 0.5s linear infinite',
                }}
              />
            ))}

            {/* Road edge markings */}
            <div className="absolute top-0 bottom-0 left-0 w-1" style={{ background: 'linear-gradient(to bottom, #ef4444, #f59e0b)' }} />
            <div className="absolute top-0 bottom-0 right-0 w-1" style={{ background: 'linear-gradient(to bottom, #ef4444, #f59e0b)' }} />

            {/* Obstacles */}
            {obstacles.map(obs => (
              <motion.div
                key={obs.id}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${obs.lane * laneWidth + laneWidth / 2}%`,
                  top: `${(obs.row / RACER_ROWS) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 32,
                  height: 32,
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {obs.type === 'coin' ? (
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Coin size={22} />
                  </motion.div>
                ) : obs.type === 'banana' ? (
                  <span className="text-xl">🍌</span>
                ) : (
                  <Kart size={28} color={OBSTACLE_COLORS[obs.id % OBSTACLE_COLORS.length]} />
                )}
              </motion.div>
            ))}

            {/* Player kart */}
            <motion.div
              className="absolute flex items-center justify-center"
              animate={{ left: `${playerLane * laneWidth + laneWidth / 2}%` }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                bottom: '8%',
                transform: 'translateX(-50%)',
                filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.4))',
              }}
            >
              <Kart size={36} color="#10b981" />
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => moveLane(-1)}
              className="h-12 w-16 rounded-xl bg-white/10 flex items-center justify-center text-white/70 active:bg-emerald-500/30 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <button
              onClick={() => moveLane(1)}
              className="h-12 w-16 rounded-xl bg-white/10 flex items-center justify-center text-white/70 active:bg-emerald-500/30 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME 6: Darts — gooi op het bord!
// ═══════════════════════════════════════════════════════════════
const DART_RINGS = [
  { maxR: 0.08, score: 50, label: 'Bullseye!', color: '#fbbf24' },
  { maxR: 0.18, score: 25, label: 'Inner Bull', color: '#10b981' },
  { maxR: 0.35, score: 15, label: 'Triple Ring', color: '#ef4444' },
  { maxR: 0.55, score: 10, label: 'Goed schot', color: '#10b981' },
  { maxR: 0.75, score: 5, label: 'Outer Ring', color: '#ef4444' },
  { maxR: 1.0, score: 2, label: 'Rand', color: '#1e293b' },
];

function DartsGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const [darts, setDarts] = useState<{ x: number; y: number; score: number }[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [dartsLeft, setDartsLeft] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [aimX, setAimX] = useState(0.5);
  const [aimY, setAimY] = useState(0.5);
  const [throwing, setThrowing] = useState(false);
  const [lastHitLabel, setLastHitLabel] = useState('');
  const [lastHitScore, setLastHitScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const aimRef = useRef({ x: 0.5, y: 0.5, vx: 0.012, vy: 0.008, angle: 0 });
  const animRef = useRef<number>(0);

  // Aim wobble animation
  useEffect(() => {
    if (gameOver || throwing) return;
    const animate = () => {
      const aim = aimRef.current;
      aim.angle += 0.03;
      const wobbleX = Math.sin(aim.angle) * 0.08 + Math.sin(aim.angle * 1.7) * 0.04;
      const wobbleY = Math.cos(aim.angle * 0.8) * 0.08 + Math.cos(aim.angle * 2.1) * 0.03;
      aim.x = 0.5 + wobbleX;
      aim.y = 0.5 + wobbleY;
      setAimX(aim.x);
      setAimY(aim.y);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameOver, throwing]);

  const throwDart = () => {
    if (throwing || gameOver || dartsLeft <= 0) return;
    setThrowing(true);

    // Add some randomness to where it lands
    const jitter = 0.03;
    const finalX = aimRef.current.x + (Math.random() - 0.5) * jitter;
    const finalY = aimRef.current.y + (Math.random() - 0.5) * jitter;

    // Calculate distance from center (0-1 scale, where 1 = edge of board)
    const dx = finalX - 0.5;
    const dy = finalY - 0.5;
    const dist = Math.sqrt(dx * dx + dy * dy) * 2; // Normalize: 0.5 radius -> 1.0

    // Find which ring
    const ring = DART_RINGS.find(r => dist <= r.maxR) || DART_RINGS[DART_RINGS.length - 1];

    setTimeout(() => {
      setDarts(prev => [...prev, { x: finalX, y: finalY, score: ring.score }]);
      setTotalScore(s => s + ring.score);
      setLastHitLabel(ring.label);
      setLastHitScore(ring.score);
      setDartsLeft(d => d - 1);
      setThrowing(false);

      if (dartsLeft <= 1) {
        const finalTotal = totalScore + ring.score;
        setGameOver(true);
        onScore(finalTotal);
        if (finalTotal >= 100) setShowConfetti(true);
      }
    }, 300);
  };

  const resetGame = () => {
    setDarts([]);
    setTotalScore(0);
    setDartsLeft(5);
    setGameOver(false);
    setThrowing(false);
    setLastHitLabel('');
    setLastHitScore(0);
    setShowConfetti(false);
    aimRef.current = { x: 0.5, y: 0.5, vx: 0.012, vy: 0.008, angle: 0 };
  };

  return (
    <div className="relative flex flex-col h-full">
      <Confetti active={showConfetti} />
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-400 font-bold">{totalScore} pts</span>
          <span className="text-amber-400 font-medium">{dartsLeft} pijlen</span>
        </div>
      </div>

      {/* Darts remaining indicator */}
      <div className="flex justify-center gap-1.5 px-3 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < dartsLeft ? '#f59e0b' : 'rgba(255,255,255,0.05)' }}
          />
        ))}
      </div>

      {gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.6 }}>
            <GameBear size={64} mood={totalScore >= 100 ? 'excited' : totalScore >= 50 ? 'happy' : 'thinking'} />
          </motion.div>
          <p className="text-white font-bold text-xl">
            {totalScore >= 150 ? 'Kampioen!' : totalScore >= 100 ? 'Geweldig!' : totalScore >= 50 ? 'Niet slecht!' : 'Oefenen!'}
          </p>
          <div className="flex gap-3 text-xs text-slate-400">
            {darts.map((d, i) => (
              <span key={i} className="px-2 py-1 rounded-lg bg-white/5">{d.score}</span>
            ))}
          </div>
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400 font-bold text-3xl">{totalScore} pts</motion.p>
          <button onClick={resetGame} className="mt-3 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 text-white text-sm font-semibold hover:from-amber-400 hover:to-red-400 transition-all shadow-lg shadow-amber-500/20">
            Opnieuw gooien
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-3 pb-3">
          {/* Hit feedback */}
          <AnimatePresence>
            {lastHitLabel && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-2 text-center"
              >
                <span className="text-amber-400 font-bold text-sm">{lastHitLabel}</span>
                <span className="text-emerald-400 font-bold text-sm ml-2">+{lastHitScore}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dartboard */}
          <div
            ref={boardRef}
            onClick={throwDart}
            className="relative w-full max-w-[240px] aspect-square rounded-full cursor-crosshair overflow-hidden"
            style={{ background: '#0f172a' }}
          >
            {/* Board rings */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              {/* Outer board */}
              <circle cx="50" cy="50" r="50" fill="#1e293b" />
              {/* Scoring rings - from outside in */}
              <circle cx="50" cy="50" r="48" fill="#0f172a" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="37" fill="#ef4444" opacity="0.15" stroke="rgba(239,68,68,0.3)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="27" fill="#10b981" opacity="0.15" stroke="rgba(16,185,129,0.3)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="17" fill="#ef4444" opacity="0.2" stroke="rgba(239,68,68,0.4)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="9" fill="#10b981" opacity="0.25" stroke="rgba(16,185,129,0.5)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="4" fill="#fbbf24" opacity="0.5" stroke="rgba(251,191,36,0.6)" strokeWidth="0.5" />
              {/* Crosshair lines */}
              <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
              <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
              {/* Number markers */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
                <line
                  key={angle}
                  x1={50 + Math.cos(angle * Math.PI / 180) * 42}
                  y1={50 + Math.sin(angle * Math.PI / 180) * 42}
                  x2={50 + Math.cos(angle * Math.PI / 180) * 48}
                  y2={50 + Math.sin(angle * Math.PI / 180) * 48}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="0.5"
                />
              ))}
            </svg>

            {/* Thrown darts */}
            {darts.map((dart, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute z-20"
                style={{
                  left: `${dart.x * 100}%`,
                  top: `${dart.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-red-500 shadow-lg shadow-amber-500/40" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white" />
                </div>
              </motion.div>
            ))}

            {/* Aim crosshair */}
            {!throwing && (
              <motion.div
                className="absolute z-30 pointer-events-none"
                style={{
                  left: `${aimX * 100}%`,
                  top: `${aimY * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 rounded-full border-2 border-white/40" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/40" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/40" />
                  <motion.div
                    className="absolute inset-1 rounded-full border border-emerald-400/60"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            )}

            {/* Throwing dart animation */}
            {throwing && (
              <motion.div
                initial={{ scale: 2, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute z-30 pointer-events-none"
                style={{
                  left: `${aimX * 100}%`,
                  top: `${aimY * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="w-4 h-4 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
              </motion.div>
            )}
          </div>

          <motion.p
            className="text-slate-500 text-xs mt-3"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Klik op het bord om te gooien!
          </motion.p>

          {/* Score rings legend */}
          <div className="flex gap-2 mt-2 text-[9px] text-slate-600">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400/50" /> 50</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500/30" /> 25</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500/30" /> 15</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500/20" /> 10</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME MENU
// ═══════════════════════════════════════════════════════════════
const GAMES = [
  { id: 'memory' as GameId, name: 'Memory', color: '#8b5cf6', desc: 'Vind alle paren', icon: (s: number) => <Ghost size={s} color="#8b5cf6" /> },
  { id: 'snake' as GameId, name: 'Snake', color: '#10b981', desc: 'Verzamel munten', icon: (s: number) => <Coin size={s} /> },
  { id: 'whack' as GameId, name: 'Whack', color: '#f59e0b', desc: 'Tik de figuurtjes', icon: (s: number) => <Mushroom size={s} color="#f59e0b" /> },
  { id: 'speed' as GameId, name: 'Speed', color: '#ef4444', desc: 'Vang ze allemaal', icon: (s: number) => <Star size={s} color="#ef4444" /> },
  { id: 'racer' as GameId, name: 'Racer', color: '#ef4444', desc: 'Ontwijken & racen', icon: (s: number) => <Kart size={s} color="#ef4444" /> },
  { id: 'darts' as GameId, name: 'Darts', color: '#f59e0b', desc: 'Gooi raak!', icon: (s: number) => <Dartboard size={s} /> },
];

// ═══════════════════════════════════════════════════════════════
// MAIN WIDGET
// ═══════════════════════════════════════════════════════════════
export default function MiniGames() {
  const [open, setOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState<GameId>('menu');
  const [scores, setScores] = useState<HighScores>({ memory: 0, snake: 0, whack: 0, speed: 0, racer: 0, darts: 0 });
  const [mounted, setMounted] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    setMounted(true);
    setScores(loadScores());
    const timer = setTimeout(() => setShowBubble(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  const handleScore = useCallback((game: keyof HighScores) => (score: number) => {
    const updated = saveScore(game, score);
    setScores(updated);
  }, []);

  const goToMenu = () => setCurrentGame('menu');

  if (!mounted) return null;

  return (
    <>
      {/* Proactive bubble */}
      <AnimatePresence>
        {showBubble && !open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-[88px] left-5 z-[998] cursor-pointer"
            onClick={() => { setOpen(true); setShowBubble(false); }}
          >
            <div className="bg-white rounded-2xl rounded-bl-sm shadow-lg shadow-slate-200/60 px-4 py-3 relative max-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <GameBear size={20} mood="playing" />
                <p className="text-slate-700 text-xs font-semibold">Even pauze?</p>
              </div>
              <p className="text-slate-400 text-[10px]">Speel een mini-game terwijl je wacht!</p>
              <button
                onClick={(e) => { e.stopPropagation(); setShowBubble(false); }}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] hover:bg-slate-300 transition-colors"
              >
                x
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => { setOpen(!open); setShowBubble(false); }}
        className="fixed bottom-5 left-5 z-[998] h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group"
        style={{
          background: open
            ? 'linear-gradient(135deg, #ef4444, #f59e0b)'
            : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          boxShadow: open
            ? '0 8px 30px rgba(239,68,68,0.3)'
            : '0 8px 30px rgba(139,92,246,0.3)',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? 'Sluit mini-games' : 'Open mini-games'}
      >
        {open ? (
          <motion.span animate={{ rotate: 180 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="text-white text-lg font-bold">
            x
          </motion.span>
        ) : (
          <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
            <GameBear size={32} mood="happy" />
          </motion.div>
        )}
      </motion.button>

      {/* Game panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed z-[997] bottom-24 left-5 w-[320px] sm:w-[340px] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'linear-gradient(180deg, #0f0f23, #050810)',
              maxHeight: 'min(520px, calc(100vh - 140px))',
            }}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 flex items-center gap-3">
              <motion.div animate={{ rotate: currentGame !== 'menu' ? [0, -5, 5, 0] : 0 }} transition={{ duration: 1, repeat: currentGame !== 'menu' ? Infinity : 0, repeatDelay: 2 }}>
                <GameBear size={32} mood={currentGame === 'menu' ? 'happy' : 'playing'} />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">
                  {currentGame === 'menu' ? 'Mini Games' : GAMES.find(g => g.id === currentGame)?.name}
                </p>
                <p className="text-slate-500 text-[10px]">
                  {currentGame === 'menu' ? 'Kies een game om te spelen!' : 'Veel plezier!'}
                </p>
              </div>
              {currentGame !== 'menu' && (
                <button
                  onClick={goToMenu}
                  className="text-slate-500 hover:text-white transition-colors text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-white/10"
                >
                  Menu
                </button>
              )}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

            {/* Content */}
            <div className="h-[420px] overflow-hidden">
              <AnimatePresence mode="wait">
                {currentGame === 'menu' && (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-3 grid grid-cols-3 gap-2.5 h-full content-start"
                  >
                    {GAMES.map((game, i) => (
                      <motion.button
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => setCurrentGame(game.id)}
                        className="relative rounded-2xl p-3 flex flex-col items-center gap-1.5 text-center transition-all duration-300 group hover:scale-[1.03] active:scale-95"
                        style={{ background: `${game.color}12` }}
                      >
                        <motion.div
                          className="mb-1"
                          whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                          transition={{ duration: 0.4 }}
                        >
                          {game.icon(36)}
                        </motion.div>
                        <span className="text-white font-semibold text-sm">{game.name}</span>
                        <span className="text-slate-500 text-[10px]">{game.desc}</span>
                        {scores[game.id as keyof HighScores] > 0 && (
                          <span className="text-[10px] font-bold mt-1" style={{ color: game.color }}>
                            Best: {scores[game.id as keyof HighScores]}
                          </span>
                        )}
                        <div
                          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                          style={{ boxShadow: `inset 0 0 0 1px ${game.color}30, 0 0 20px ${game.color}10` }}
                        />
                      </motion.button>
                    ))}

                    {/* Total score */}
                    <div className="col-span-3 mt-2 px-4 py-3 rounded-xl bg-white/[0.03] text-center">
                      <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1">Totaal highscore</p>
                      <p className="text-white font-bold text-lg tabular-nums">
                        {Object.values(scores).reduce((a, b) => a + b, 0)}
                        <span className="text-slate-500 text-xs font-normal ml-1">pts</span>
                      </p>
                    </div>
                  </motion.div>
                )}

                {currentGame === 'memory' && (
                  <motion.div key="memory" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                    <MemoryGame onBack={goToMenu} onScore={handleScore('memory')} />
                  </motion.div>
                )}
                {currentGame === 'snake' && (
                  <motion.div key="snake" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                    <SnakeGame onBack={goToMenu} onScore={handleScore('snake')} />
                  </motion.div>
                )}
                {currentGame === 'whack' && (
                  <motion.div key="whack" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                    <WhackGame onBack={goToMenu} onScore={handleScore('whack')} />
                  </motion.div>
                )}
                {currentGame === 'speed' && (
                  <motion.div key="speed" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                    <SpeedGame onBack={goToMenu} onScore={handleScore('speed')} />
                  </motion.div>
                )}
                {currentGame === 'racer' && (
                  <motion.div key="racer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                    <RacerGame onBack={goToMenu} onScore={handleScore('racer')} />
                  </motion.div>
                )}
                {currentGame === 'darts' && (
                  <motion.div key="darts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                    <DartsGame onBack={goToMenu} onScore={handleScore('darts')} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
