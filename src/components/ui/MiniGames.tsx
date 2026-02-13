'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ──────────────────────────────────────────────────
type GameId = 'menu' | 'memory' | 'snake' | 'whack' | 'speed';

interface HighScores {
  memory: number;
  snake: number;
  whack: number;
  speed: number;
}

const STORAGE_KEY = 'gameshop-minigames';

function loadScores(): HighScores {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : { memory: 0, snake: 0, whack: 0, speed: 0 };
  } catch { return { memory: 0, snake: 0, whack: 0, speed: 0 }; }
}

function saveScore(game: keyof HighScores, score: number) {
  const scores = loadScores();
  if (score > scores[game]) {
    scores[game] = score;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(scores)); } catch {}
  }
  return scores;
}

// ─── Bear SVG (simpel, schattig) ────────────────────────────
function BearFace({ size = 40, expression = 'happy' }: { size?: number; expression?: 'happy' | 'sad' | 'excited' | 'thinking' }) {
  const mouth = {
    happy: 'M14 20 Q17 24 20 20',
    sad: 'M14 22 Q17 19 20 22',
    excited: 'M13 19 Q17 25 21 19 Z',
    thinking: 'M15 21 L19 21',
  }[expression];
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <circle cx="17" cy="18" r="14" fill="#8B6914" />
      <circle cx="17" cy="18" r="12" fill="#C4943D" />
      <circle cx="7" cy="10" r="5" fill="#8B6914" />
      <circle cx="7" cy="10" r="3.5" fill="#D4A76A" />
      <circle cx="27" cy="10" r="5" fill="#8B6914" />
      <circle cx="27" cy="10" r="3.5" fill="#D4A76A" />
      <circle cx="13" cy="16" r="2" fill="#2D1B00" />
      <circle cx="21" cy="16" r="2" fill="#2D1B00" />
      <circle cx="13.5" cy="15.3" r="0.7" fill="white" />
      <circle cx="21.5" cy="15.3" r="0.7" fill="white" />
      <path d={mouth} stroke="#2D1B00" strokeWidth="1.5" strokeLinecap="round" fill={expression === 'excited' ? '#2D1B00' : 'none'} />
      <ellipse cx="17" cy="18" rx="2.5" ry="2" fill="#D4A76A" />
      <circle cx="17" cy="17.5" r="1.2" fill="#2D1B00" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME 1: Memory Match
// ═══════════════════════════════════════════════════════════════
const MEMORY_ICONS = ['🎮', '🕹️', '👾', '🏆', '⭐', '💎', '🔥', '🎯'];

function MemoryGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const [cards, setCards] = useState<{ id: number; icon: string; flipped: boolean; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(0);
  const [started, setStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const initGame = useCallback(() => {
    const icons = MEMORY_ICONS.slice(0, 8);
    const deck = [...icons, ...icons]
      .map((icon, i) => ({ id: i, icon, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);
    setCards(deck);
    setSelected([]);
    setMoves(0);
    setMatches(0);
    setGameOver(false);
    setTimer(0);
    setStarted(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => { initGame(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [initGame]);

  useEffect(() => {
    if (matches === 8 && !gameOver) {
      setGameOver(true);
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
      if (newCards[newSel[0]].icon === newCards[newSel[1]].icon) {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => newSel.includes(i) ? { ...c, matched: true } : c));
          setSelected([]);
          setMatches(m => m + 1);
        }, 400);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => newSel.includes(i) ? { ...c, flipped: false } : c));
          setSelected([]);
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-amber-400">{moves} zetten</span>
          <span className="text-emerald-400">{timer}s</span>
          <span className="text-cyan-400">{matches}/8</span>
        </div>
      </div>

      {gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <BearFace size={56} expression="excited" />
          <p className="text-white font-semibold text-lg">Gewonnen!</p>
          <p className="text-slate-400 text-sm">{moves} zetten in {timer}s</p>
          <p className="text-emerald-400 font-bold text-2xl">{Math.max(0, 1000 - moves * 20 - timer * 2)} pts</p>
          <button onClick={initGame} className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition-colors">
            Opnieuw
          </button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center px-3 pb-3">
          <div className="grid grid-cols-4 gap-2 w-full max-w-[280px]">
            {cards.map((card, i) => (
              <button
                key={card.id}
                onClick={() => handleClick(i)}
                className="aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-300 select-none"
                style={{
                  background: card.flipped || card.matched
                    ? card.matched ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'
                    : 'rgba(255,255,255,0.05)',
                  transform: card.flipped || card.matched ? 'rotateY(0deg)' : 'rotateY(180deg)',
                  border: card.matched ? '2px solid rgba(16,185,129,0.4)' : '2px solid rgba(255,255,255,0.06)',
                }}
              >
                {card.flipped || card.matched ? card.icon : '?'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME 2: Snake
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
  const dirRef = useRef<Dir>('UP');
  const gameRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const FOOD_ICONS = ['🟡', '🔴', '🟢', '🔵', '🟣'];

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
        if (gameRef.current) clearInterval(gameRef.current);
        return prev;
      }

      const newSnake = [head, ...prev];
      setFood(f => {
        if (head[0] === f[0] && head[1] === f[1]) {
          setScore(s => s + 10);
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
    if (gameOver) { onScore(score); return; }
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

  // Touch controls
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <span className="text-emerald-400 font-bold text-sm">{score} pts</span>
      </div>

      {gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <BearFace size={56} expression="sad" />
          <p className="text-white font-semibold text-lg">Game Over!</p>
          <p className="text-emerald-400 font-bold text-2xl">{score} pts</p>
          <button onClick={resetGame} className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition-colors">
            Opnieuw
          </button>
        </div>
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
            <p className="text-slate-500 text-xs mb-2 animate-pulse">Pijltjestoetsen of swipe om te starten</p>
          )}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID}, 1fr)`,
              gap: '1px',
              background: 'rgba(255,255,255,0.03)',
              width: '100%',
              maxWidth: '280px',
              aspectRatio: '1',
            }}
          >
            {Array.from({ length: GRID * GRID }).map((_, i) => {
              const row = Math.floor(i / GRID);
              const col = i % GRID;
              const isSnake = snake.some(s => s[0] === row && s[1] === col);
              const isHead = snake[0][0] === row && snake[0][1] === col;
              const isFood = food[0] === row && food[1] === col;
              return (
                <div
                  key={i}
                  className="aspect-square flex items-center justify-center text-[8px]"
                  style={{
                    background: isHead
                      ? '#10b981'
                      : isSnake
                        ? 'rgba(16,185,129,0.6)'
                        : isFood
                          ? 'rgba(251,191,36,0.3)'
                          : 'rgba(255,255,255,0.01)',
                    borderRadius: isHead ? '3px' : isSnake ? '2px' : '1px',
                    transition: 'background 0.1s',
                  }}
                >
                  {isFood && FOOD_ICONS[score / 10 % FOOD_ICONS.length | 0]}
                </div>
              );
            })}
          </div>

          {/* Mobile D-pad */}
          <div className="grid grid-cols-3 gap-1 mt-3 sm:hidden w-[120px]">
            <div />
            <button onTouchStart={() => { dirRef.current = 'UP'; setDir('UP'); if (!started) setStarted(true); }} className="h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 active:bg-white/20">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
            </button>
            <div />
            <button onTouchStart={() => { dirRef.current = 'LEFT'; setDir('LEFT'); if (!started) setStarted(true); }} className="h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 active:bg-white/20">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <button onTouchStart={() => { dirRef.current = 'DOWN'; setDir('DOWN'); if (!started) setStarted(true); }} className="h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 active:bg-white/20">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
            <button onTouchStart={() => { dirRef.current = 'RIGHT'; setDir('RIGHT'); if (!started) setStarted(true); }} className="h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 active:bg-white/20">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME 3: Whack-a-Mole
// ═══════════════════════════════════════════════════════════════
function WhackGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const [holes, setHoles] = useState<boolean[]>(Array(9).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lastHit, setLastHit] = useState<number | null>(null);
  const holeTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

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
    const hideDelay = Math.max(400, 1200 - score * 15);
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
    clearTimers();
  };

  useEffect(() => {
    if (!started || gameOver) return;
    const spawnRate = Math.max(300, 800 - score * 10);
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
    if (gameOver && started) onScore(score);
  }, [gameOver, started, score, onScore]);

  const whack = (idx: number) => {
    if (!holes[idx] || gameOver) return;
    setHoles(prev => {
      const n = [...prev];
      n[idx] = false;
      return n;
    });
    setScore(s => s + 1);
    setLastHit(idx);
    setTimeout(() => setLastHit(null), 300);
  };

  const MOLE_FACES = ['🐻', '🎮', '⭐', '💎', '🏆', '🕹️', '👾', '🔥', '🎯'];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-400 font-bold">{score} hits</span>
          <span className={`font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-amber-400'}`}>{timeLeft}s</span>
        </div>
      </div>

      {!started || gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <BearFace size={56} expression={gameOver ? 'excited' : 'happy'} />
          {gameOver ? (
            <>
              <p className="text-white font-semibold text-lg">Tijd voorbij!</p>
              <p className="text-emerald-400 font-bold text-2xl">{score} hits</p>
            </>
          ) : (
            <>
              <p className="text-white font-semibold text-lg">Whack-a-Mole</p>
              <p className="text-slate-400 text-xs text-center">Tik zo snel mogelijk op de iconen!</p>
            </>
          )}
          <button onClick={startGame} className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition-colors">
            {gameOver ? 'Opnieuw' : 'Start!'}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center px-3 pb-3">
          <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
            {holes.map((active, i) => (
              <button
                key={i}
                onClick={() => whack(i)}
                className="aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all duration-150 select-none active:scale-90"
                style={{
                  background: lastHit === i
                    ? 'rgba(16,185,129,0.3)'
                    : active
                      ? 'rgba(251,191,36,0.15)'
                      : 'rgba(255,255,255,0.04)',
                  transform: active ? 'scale(1)' : 'scale(0.85)',
                  opacity: active ? 1 : 0.3,
                }}
              >
                {active ? MOLE_FACES[i] : '⚫'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME 4: Speed Click
// ═══════════════════════════════════════════════════════════════
function SpeedGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const [targets, setTargets] = useState(0);
  const [maxTargets] = useState(20);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [targetSize, setTargetSize] = useState(48);
  const areaRef = useRef<HTMLDivElement>(null);

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
    spawnTarget();
  };

  const hitTarget = () => {
    const newCount = targets + 1;
    setTargets(newCount);
    if (newCount >= maxTargets) {
      const elapsed = (Date.now() - startTime) / 1000;
      setTotalTime(elapsed);
      setGameOver(true);
      setStarted(false);
      const sc = Math.round(Math.max(0, 2000 - elapsed * 50));
      onScore(sc);
    } else {
      spawnTarget();
    }
  };

  const COLORS = ['#10b981', '#0d9488', '#0891b2', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-400 font-bold">{targets}/{maxTargets}</span>
          {started && <span className="text-amber-400">{((Date.now() - startTime) / 1000).toFixed(1)}s</span>}
        </div>
      </div>

      {!started && !gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <BearFace size={56} expression="thinking" />
          <p className="text-white font-semibold text-lg">Speed Click</p>
          <p className="text-slate-400 text-xs text-center">Klik {maxTargets} targets zo snel mogelijk!</p>
          <button onClick={startGame} className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition-colors">
            Start!
          </button>
        </div>
      ) : gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <BearFace size={56} expression="excited" />
          <p className="text-white font-semibold text-lg">Klaar!</p>
          <p className="text-slate-400 text-sm">{totalTime.toFixed(2)}s voor {maxTargets} targets</p>
          <p className="text-amber-400 text-xs">{(totalTime / maxTargets * 1000).toFixed(0)}ms gemiddeld</p>
          <p className="text-emerald-400 font-bold text-2xl">{Math.round(Math.max(0, 2000 - totalTime * 50))} pts</p>
          <button onClick={startGame} className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition-colors">
            Opnieuw
          </button>
        </div>
      ) : (
        <div
          ref={areaRef}
          className="flex-1 relative mx-3 mb-3 rounded-xl overflow-hidden cursor-crosshair"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <motion.button
            key={targets}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            onClick={hitTarget}
            className="absolute rounded-full flex items-center justify-center text-white font-bold shadow-lg active:scale-75 transition-transform"
            style={{
              width: targetSize,
              height: targetSize,
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              background: COLORS[targets % COLORS.length],
              fontSize: targetSize > 36 ? '16px' : '12px',
            }}
          >
            {targets + 1}
          </motion.button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME MENU
// ═══════════════════════════════════════════════════════════════
const GAMES = [
  { id: 'memory' as GameId, name: 'Memory', emoji: '🧠', color: '#8b5cf6', desc: 'Vind alle paren' },
  { id: 'snake' as GameId, name: 'Snake', emoji: '🐍', color: '#10b981', desc: 'Klassieke snake' },
  { id: 'whack' as GameId, name: 'Whack', emoji: '🔨', color: '#f59e0b', desc: 'Tik de moles' },
  { id: 'speed' as GameId, name: 'Speed', emoji: '⚡', color: '#ef4444', desc: 'Klik zo snel je kan' },
];

// ═══════════════════════════════════════════════════════════════
// MAIN WIDGET
// ═══════════════════════════════════════════════════════════════
export default function MiniGames() {
  const [open, setOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState<GameId>('menu');
  const [scores, setScores] = useState<HighScores>({ memory: 0, snake: 0, whack: 0, speed: 0 });
  const [mounted, setMounted] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    setMounted(true);
    setScores(loadScores());
    const timer = setTimeout(() => setShowBubble(true), 25000);
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
            <div className="bg-white rounded-2xl rounded-bl-sm shadow-lg shadow-slate-200/60 px-4 py-2.5 relative max-w-[180px]">
              <p className="text-slate-700 text-xs font-medium">Verveel je je? 🎮</p>
              <p className="text-slate-400 text-[10px]">Speel een mini-game!</p>
              <button
                onClick={(e) => { e.stopPropagation(); setShowBubble(false); }}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] hover:bg-slate-300"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => { setOpen(!open); setShowBubble(false); }}
        className="fixed bottom-5 left-5 z-[998] h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300"
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
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-2xl"
        >
          {open ? '✕' : '🎮'}
        </motion.span>
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
              <BearFace size={32} expression={currentGame === 'menu' ? 'happy' : 'excited'} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">
                  {currentGame === 'menu' ? 'Mini Games' : GAMES.find(g => g.id === currentGame)?.name}
                </p>
                <p className="text-slate-500 text-[10px]">
                  {currentGame === 'menu' ? 'Kies een game!' : 'Veel plezier!'}
                </p>
              </div>
              {currentGame !== 'menu' && (
                <button
                  onClick={goToMenu}
                  className="text-slate-500 hover:text-white transition-colors text-xs font-medium px-2 py-1 rounded-lg hover:bg-white/10"
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
                    className="p-4 grid grid-cols-2 gap-3 h-full content-start"
                  >
                    {GAMES.map((game, i) => (
                      <motion.button
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => setCurrentGame(game.id)}
                        className="relative rounded-2xl p-4 flex flex-col items-center gap-2 text-center transition-all duration-300 group hover:scale-[1.03] active:scale-95"
                        style={{ background: `${game.color}15` }}
                      >
                        <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{game.emoji}</span>
                        <span className="text-white font-semibold text-sm">{game.name}</span>
                        <span className="text-slate-500 text-[10px]">{game.desc}</span>
                        {scores[game.id as keyof HighScores] > 0 && (
                          <span className="text-[10px] font-bold mt-1" style={{ color: game.color }}>
                            Best: {scores[game.id as keyof HighScores]}
                          </span>
                        )}
                        <div
                          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                          style={{ boxShadow: `inset 0 0 0 1px ${game.color}40` }}
                        />
                      </motion.button>
                    ))}

                    {/* Total score */}
                    <div className="col-span-2 mt-2 px-4 py-3 rounded-xl bg-white/[0.03] text-center">
                      <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1">Totaal highscore</p>
                      <p className="text-white font-bold text-lg">
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
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
