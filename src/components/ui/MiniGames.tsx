'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ──────────────────────────────────────────────────
type GameId = 'menu' | 'memory' | 'snake' | 'whack' | 'speed' | 'racer' | 'darts' | 'blackjack';

interface HighScores {
  memory: number;
  snake: number;
  whack: number;
  speed: number;
  racer: number;
  darts: number;
  blackjack: number;
}

const STORAGE_KEY = 'gameshop-minigames';

function loadScores(): HighScores {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : { memory: 0, snake: 0, whack: 0, speed: 0, racer: 0, darts: 0, blackjack: 0 };
  } catch { return { memory: 0, snake: 0, whack: 0, speed: 0, racer: 0, darts: 0, blackjack: 0 }; }
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

// ─── Iconische gaming figuren ────────────────────────────────
// Pac-Man achtig figuurtje
function PacMan({ size = 24, color = '#fbbf24' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22 12 A10 10 0 1 1 22 11.99 L12 12 Z" fill={color} transform="rotate(-30 12 12)" />
      <circle cx="13" cy="7" r="1.5" fill="#2D1B00" />
    </svg>
  );
}

// Pokéball
function PokeBall({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#ef4444" />
      <rect x="2" y="11" width="20" height="2" fill="#1e293b" />
      <path d="M2 12 A10 10 0 0 1 22 12" fill="#ef4444" />
      <path d="M2 12 A10 10 0 0 0 22 12" fill="white" />
      <circle cx="12" cy="12" r="3.5" fill="#1e293b" />
      <circle cx="12" cy="12" r="2.5" fill="white" />
      <circle cx="12" cy="12" r="1.2" fill="#1e293b" />
    </svg>
  );
}

// Retro Space Invader
function Invader({ size = 24, color = '#10b981' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="2" height="2" fill={color} />
      <rect x="19" y="5" width="2" height="2" fill={color} />
      <rect x="5" y="7" width="14" height="2" fill={color} />
      <rect x="3" y="9" width="18" height="2" fill={color} />
      <rect x="3" y="11" width="4" height="2" fill={color} />
      <rect x="9" y="11" width="6" height="2" fill={color} />
      <rect x="17" y="11" width="4" height="2" fill={color} />
      <rect x="5" y="13" width="2" height="2" fill={color} />
      <rect x="9" y="13" width="2" height="2" fill={color} />
      <rect x="13" y="13" width="2" height="2" fill={color} />
      <rect x="17" y="13" width="2" height="2" fill={color} />
      {/* Eyes */}
      <rect x="7" y="9" width="2" height="2" fill="white" />
      <rect x="15" y="9" width="2" height="2" fill="white" />
    </svg>
  );
}

// Triforce / power triangle
function Triforce({ size = 24, color = '#fbbf24' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <polygon points="12,2 6,12 18,12" fill={color} />
      <polygon points="6,12 0,22 12,22" fill={color} opacity="0.7" />
      <polygon points="18,12 12,22 24,22" fill={color} opacity="0.7" />
    </svg>
  );
}

// 1-Up Mushroom (groene variant)
function OneUp({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="10" rx="10" ry="8" fill="#10b981" />
      <circle cx="8" cy="8" r="2.5" fill="white" opacity="0.9" />
      <circle cx="16" cy="7" r="2" fill="white" opacity="0.9" />
      <circle cx="12" cy="12" r="1.5" fill="white" opacity="0.7" />
      <rect x="9" y="16" width="6" height="6" rx="1" fill="#F5E6C8" />
      <circle cx="10" cy="14" r="0.8" fill="#2D1B00" />
      <circle cx="14" cy="14" r="0.8" fill="#2D1B00" />
      <path d="M11 15 Q12 16 13 15" stroke="#2D1B00" strokeWidth="0.6" fill="none" />
    </svg>
  );
}

function Kart({ size = 24, color = '#ef4444' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Body */}
      <rect x="6" y="9" width="12" height="9" rx="3" fill={color} />
      <rect x="7" y="7" width="10" height="6" rx="2" fill={color} opacity="0.8" />
      {/* Windshield */}
      <rect x="8.5" y="7.5" width="7" height="3.5" rx="1.5" fill="#0ea5e9" opacity="0.5" />
      {/* Wheels */}
      <rect x="4" y="11" width="3" height="5" rx="1.5" fill="#1e293b" />
      <rect x="17" y="11" width="3" height="5" rx="1.5" fill="#1e293b" />
      <rect x="4.5" y="12" width="2" height="1" rx="0.5" fill="#94a3b8" />
      <rect x="17.5" y="12" width="2" height="1" rx="0.5" fill="#94a3b8" />
      {/* Bear driver — ears */}
      <circle cx="9.5" cy="4" r="1.5" fill="#8B6914" />
      <circle cx="9.5" cy="4" r="0.8" fill="#D4A76A" />
      <circle cx="14.5" cy="4" r="1.5" fill="#8B6914" />
      <circle cx="14.5" cy="4" r="0.8" fill="#D4A76A" />
      {/* Bear head */}
      <circle cx="12" cy="5.5" r="3" fill="#C4943D" />
      <circle cx="12" cy="5.5" r="2.5" fill="#D4A76A" />
      {/* Bear eyes */}
      <circle cx="10.8" cy="5" r="0.5" fill="#2D1B00" />
      <circle cx="13.2" cy="5" r="0.5" fill="#2D1B00" />
      <circle cx="11" cy="4.8" r="0.15" fill="white" />
      <circle cx="13.4" cy="4.8" r="0.15" fill="white" />
      {/* Bear nose */}
      <circle cx="12" cy="5.8" r="0.4" fill="#2D1B00" />
      {/* Bear mouth — determined grin */}
      <path d="M11 6.5 Q12 7.2 13 6.5" stroke="#2D1B00" strokeWidth="0.4" fill="none" />
      {/* Racing stripe */}
      <rect x="10.5" y="10" width="3" height="7" rx="1" fill="white" opacity="0.25" />
      {/* Number circle */}
      <circle cx="12" cy="13" r="2" fill="white" opacity="0.3" />
      <text x="12" y="14" textAnchor="middle" fill={color} fontSize="3" fontWeight="bold" opacity="0.6">1</text>
      {/* Exhaust */}
      <circle cx="12" cy="19" r="1" fill="#94a3b8" opacity="0.4" />
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
  { id: 'ghost', render: (s: number) => <Ghost size={s} color="#8b5cf6" /> },
  { id: 'pacman', render: (s: number) => <PacMan size={s} /> },
  { id: 'pokeball', render: (s: number) => <PokeBall size={s} /> },
  { id: 'invader', render: (s: number) => <Invader size={s} color="#10b981" /> },
  { id: 'triforce', render: (s: number) => <Triforce size={s} /> },
  { id: 'oneup', render: (s: number) => <OneUp size={s} /> },
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
  (s: number) => <PacMan size={s} />,
  (s: number) => <Invader size={s} color="#10b981" />,
  (s: number) => <PokeBall size={s} />,
  (s: number) => <OneUp size={s} />,
  (s: number) => <Triforce size={s} />,
  (s: number) => <Star size={s} color="#ec4899" />,
  (s: number) => <GameBear size={s} mood="excited" />,
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
  (s: number) => <PacMan size={s} />,
  (s: number) => <Invader size={s} color="#ef4444" />,
  (s: number) => <PokeBall size={s} />,
  (s: number) => <Ghost size={s} color="#8b5cf6" />,
  (s: number) => <Triforce size={s} />,
  (s: number) => <OneUp size={s} />,
  (s: number) => <Mushroom size={s} color="#f97316" />,
  (s: number) => <GameBear size={s} mood="happy" />,
  (s: number) => <Invader size={s} color="#0ea5e9" />,
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
// GAME 5: Mini Kart — Mario Kart style met items & lives
// ═══════════════════════════════════════════════════════════════
const RACER_LANES = 3;
const RACER_ROWS = 14;
type RacerItem = 'mushroom' | 'star' | 'shell' | null;
type ObsType = 'kart' | 'banana' | 'coin' | 'itembox';
type RacerObstacle = { lane: number; row: number; type: ObsType; id: number; color: string };
const KART_COLORS = ['#ef4444', '#8b5cf6', '#f97316', '#0ea5e9', '#ec4899', '#f43f5e'];

// Item box SVG
function ItemBox({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#fbbf24" />
      <rect x="5" y="5" width="14" height="14" rx="2.5" fill="#f59e0b" />
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">?</text>
    </svg>
  );
}

// Banana peel SVG
function Banana({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M6 16 C4 12 5 6 10 4 C12 3 14 4 14 6 C14 9 11 13 8 15 Z" fill="#fbbf24" />
      <path d="M10 4 C12 3 14 4 14 6" stroke="#92400e" strokeWidth="1" fill="none" />
      <path d="M7 14 C6 11 7 7 10 5" stroke="#d97706" strokeWidth="0.8" fill="none" />
      <circle cx="10" cy="3.5" r="1" fill="#65a30d" />
    </svg>
  );
}

// Shell SVG
function Shell({ size = 20, color = '#10b981' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <ellipse cx="10" cy="11" rx="8" ry="6" fill={color} />
      <ellipse cx="10" cy="11" rx="6" ry="4.5" fill="white" opacity="0.2" />
      <path d="M4 11 Q7 7 10 11 Q13 7 16 11" stroke="white" strokeWidth="1" opacity="0.3" fill="none" />
      <ellipse cx="10" cy="10" rx="2" ry="1.5" fill="white" opacity="0.4" />
    </svg>
  );
}

function RacerGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const [playerLane, setPlayerLane] = useState(1);
  const [obstacles, setObstacles] = useState<RacerObstacle[]>([]);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showHitEffect, setShowHitEffect] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [item, setItem] = useState<RacerItem>(null);
  const [boosting, setBoosting] = useState(false);
  const [invincible, setInvincible] = useState(false);
  const [tilt, setTilt] = useState(0); // -1 left, 0 center, 1 right
  const [shellFlying, setShellFlying] = useState(false);
  const [exhaust, setExhaust] = useState<{ id: number; x: number }[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const spawnRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const obstacleId = useRef(0);
  const exhaustId = useRef(0);
  const gameOverRef = useRef(false);
  const playerLaneRef = useRef(1);
  const livesRef = useRef(3);
  const itemRef = useRef<RacerItem>(null);
  const invincibleRef = useRef(false);
  const boostRef = useRef(false);

  const startGame = useCallback(() => {
    setPlayerLane(1); playerLaneRef.current = 1;
    setObstacles([]); setScore(0); setCoins(0);
    setLives(3); livesRef.current = 3;
    setGameOver(false); gameOverRef.current = false;
    setStarted(true); setShowConfetti(false); setShowHitEffect(false);
    setSpeed(1); setItem(null); itemRef.current = null;
    setBoosting(false); boostRef.current = false;
    setInvincible(false); invincibleRef.current = false;
    setTilt(0); setShellFlying(false); setExhaust([]);
    obstacleId.current = 0;
  }, []);

  // Game tick
  useEffect(() => {
    if (!started || gameOver) return;
    tickRef.current = setInterval(() => {
      if (gameOverRef.current) return;

      setObstacles(prev => {
        const spd = boostRef.current ? 2 : 1;
        const moved = prev.map(o => ({ ...o, row: o.row + spd }));
        const playerRow = RACER_ROWS - 2;
        const hitZone = moved.filter(o => o.row >= playerRow - 1 && o.row <= playerRow + 1 && o.lane === playerLaneRef.current);

        for (const h of hitZone) {
          if (h.type === 'coin') {
            setCoins(c => c + 1);
            setScore(s => s + 25);
            h.row = 999; // mark for removal
          } else if (h.type === 'itembox') {
            // Pick up item
            const items: RacerItem[] = ['mushroom', 'star', 'shell'];
            const picked = items[Math.floor(Math.random() * items.length)];
            itemRef.current = picked;
            setItem(picked);
            h.row = 999;
          } else if (!invincibleRef.current) {
            // Hit obstacle
            livesRef.current--;
            setLives(livesRef.current);
            setShowHitEffect(true);
            setTimeout(() => setShowHitEffect(false), 400);
            h.row = 999;
            if (livesRef.current <= 0) {
              gameOverRef.current = true;
              setGameOver(true);
              return prev;
            }
            // Brief invincibility after hit
            invincibleRef.current = true; setInvincible(true);
            setTimeout(() => { invincibleRef.current = false; setInvincible(false); }, 1500);
          } else {
            // Invincible — destroy
            setScore(s => s + 15);
            h.row = 999;
          }
        }

        const surviving = moved.filter(o => o.row < RACER_ROWS && o.row !== 999);
        const passed = moved.filter(o => o.row >= RACER_ROWS && (o.type === 'kart' || o.type === 'banana'));
        if (passed.length > 0) setScore(s => s + passed.length * 10);
        return surviving;
      });

      setScore(s => s + (boostRef.current ? 3 : 1));

      // Exhaust particles
      exhaustId.current++;
      setExhaust(prev => {
        const next = [...prev, { id: exhaustId.current, x: playerLaneRef.current }];
        return next.slice(-6);
      });

    }, Math.max(60, 180 - speed * 6));
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [started, gameOver, speed]);

  // Spawn obstacles
  useEffect(() => {
    if (!started || gameOver) return;
    spawnRef.current = setInterval(() => {
      if (gameOverRef.current) return;
      const lane = Math.floor(Math.random() * RACER_LANES);
      const r = Math.random();
      const type: ObsType = r < 0.25 ? 'coin' : r < 0.35 ? 'itembox' : r < 0.5 ? 'banana' : 'kart';
      setObstacles(prev => [...prev, {
        lane, row: -1, type, id: obstacleId.current++,
        color: KART_COLORS[Math.floor(Math.random() * KART_COLORS.length)],
      }]);
    }, Math.max(350, 850 - speed * 20));
    return () => { if (spawnRef.current) clearInterval(spawnRef.current); };
  }, [started, gameOver, speed]);

  // Speed up
  useEffect(() => {
    if (!started || gameOver) return;
    const t = setInterval(() => setSpeed(s => s + 1), 3500);
    return () => clearInterval(t);
  }, [started, gameOver]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOverRef.current) return;
      if ((e.key === 'ArrowLeft' || e.key === 'a') && playerLaneRef.current > 0) {
        e.preventDefault();
        playerLaneRef.current--;
        setPlayerLane(playerLaneRef.current);
        setTilt(-1); setTimeout(() => setTilt(0), 200);
        if (!started) startGame();
      }
      if ((e.key === 'ArrowRight' || e.key === 'd') && playerLaneRef.current < RACER_LANES - 1) {
        e.preventDefault();
        playerLaneRef.current++;
        setPlayerLane(playerLaneRef.current);
        setTilt(1); setTimeout(() => setTilt(0), 200);
        if (!started) startGame();
      }
      if ((e.key === ' ' || e.key === 'ArrowUp') && itemRef.current) {
        e.preventDefault();
        useItem();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  const useItem = () => {
    const currentItem = itemRef.current;
    if (!currentItem) return;
    itemRef.current = null;
    setItem(null);

    if (currentItem === 'mushroom') {
      boostRef.current = true; setBoosting(true);
      setTimeout(() => { boostRef.current = false; setBoosting(false); }, 2500);
    } else if (currentItem === 'star') {
      invincibleRef.current = true; setInvincible(true);
      setTimeout(() => { invincibleRef.current = false; setInvincible(false); }, 4000);
    } else if (currentItem === 'shell') {
      setShellFlying(true);
      // Destroy nearest obstacle in player lane
      setTimeout(() => {
        setObstacles(prev => {
          const inLane = prev.filter(o => o.lane === playerLaneRef.current && o.type === 'kart');
          if (inLane.length > 0) {
            const nearest = inLane.reduce((a, b) => a.row > b.row ? a : b);
            setScore(s => s + 20);
            return prev.filter(o => o.id !== nearest.id);
          }
          return prev;
        });
        setShellFlying(false);
      }, 300);
    }
  };

  const moveLane = (dir: -1 | 1) => {
    if (gameOverRef.current) return;
    const newLane = Math.max(0, Math.min(RACER_LANES - 1, playerLaneRef.current + dir));
    playerLaneRef.current = newLane;
    setPlayerLane(newLane);
    setTilt(dir); setTimeout(() => setTilt(0), 200);
    if (!started) startGame();
  };

  useEffect(() => {
    if (gameOver && started) {
      const finalScore = score + coins * 25;
      onScore(finalScore);
      if (finalScore >= 300) setShowConfetti(true);
    }
  }, [gameOver, started, score, coins, onScore]);

  const laneW = 100 / RACER_LANES;
  const kmh = Math.round((speed + (boosting ? 4 : 0)) * 35);

  return (
    <div className="relative flex flex-col h-full">
      <Confetti active={showConfetti} />
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-2 text-[11px]">
          {/* Lives */}
          <span className="flex gap-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart key={i} size={12} color={i < lives ? '#ef4444' : '#334155'} />
            ))}
          </span>
          <span className="text-emerald-400 font-bold">{score}</span>
          <span className="text-amber-400">{coins}<span className="text-[8px] ml-0.5">×</span></span>
        </div>
      </div>

      {gameOver ? (
        <motion.div
          className="flex-1 flex flex-col items-center justify-center gap-3 px-4"
          initial={{ x: -5 }} animate={{ x: [5, -5, 3, -3, 0] }} transition={{ duration: 0.4 }}
        >
          <GameBear size={64} mood="sad" />
          <p className="text-white font-bold text-xl">Race Voorbij!</p>
          <div className="flex gap-4 text-sm text-slate-400">
            <span>{score} m</span><span>{coins} munten</span>
          </div>
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400 font-bold text-3xl">{score + coins * 25} pts</motion.p>
          <button onClick={startGame} className="mt-3 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold hover:from-red-400 hover:to-orange-400 transition-all shadow-lg shadow-red-500/20">
            Opnieuw racen
          </button>
        </motion.div>
      ) : !started ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Kart size={64} color="#ef4444" />
          </motion.div>
          <p className="text-white font-bold text-xl">Mini Kart</p>
          <p className="text-slate-400 text-xs text-center max-w-[200px]">Race, ontwijkobstakels, pak items en verzamel munten!</p>
          <div className="flex gap-3 text-[10px] text-slate-500 mt-1">
            <span className="flex items-center gap-1"><Mushroom size={14} color="#10b981" /> Boost</span>
            <span className="flex items-center gap-1"><Star size={14} color="#fbbf24" /> Ster</span>
            <span className="flex items-center gap-1"><Shell size={14} /> Shell</span>
          </div>
          <button onClick={startGame} className="mt-3 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold hover:from-red-400 hover:to-orange-400 transition-all shadow-lg shadow-red-500/20">
            Start Race!
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center px-3 pb-2">
          {/* Race track */}
          <motion.div
            className="relative w-full max-w-[260px] flex-1 rounded-xl overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #111827, #1a1a2e)' }}
            animate={showHitEffect ? { x: [4, -4, 3, -3, 0] } : {}}
            transition={{ duration: 0.3 }}
          >
            {/* Speed lines overlay */}
            {(boosting || speed > 3) && (
              <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                {Array.from({ length: boosting ? 8 : 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-px"
                    style={{
                      left: `${10 + Math.random() * 80}%`,
                      height: `${20 + Math.random() * 30}%`,
                      top: '-10%',
                      background: boosting
                        ? `linear-gradient(to bottom, transparent, rgba(251,191,36,${0.15 + Math.random() * 0.15}), transparent)`
                        : `linear-gradient(to bottom, transparent, rgba(255,255,255,${0.04 + Math.random() * 0.04}), transparent)`,
                    }}
                    animate={{ y: ['0%', '200%'] }}
                    transition={{ duration: boosting ? 0.3 : 0.6, repeat: Infinity, delay: Math.random() * 0.3, ease: 'linear' }}
                  />
                ))}
              </div>
            )}

            {/* Lane dividers */}
            {Array.from({ length: RACER_LANES - 1 }).map((_, i) => (
              <div key={i} className="absolute top-0 bottom-0 w-px" style={{
                left: `${((i + 1) * 100) / RACER_LANES}%`,
                backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 12px, transparent 12px, transparent 28px)',
                animation: `roadScroll ${boosting ? '0.2s' : '0.5s'} linear infinite`,
              }} />
            ))}

            {/* Road edges */}
            <div className="absolute top-0 bottom-0 left-0 w-1.5" style={{
              background: 'repeating-linear-gradient(to bottom, #ef4444 0px, #ef4444 8px, #fbbf24 8px, #fbbf24 16px)',
              animation: `roadScroll ${boosting ? '0.2s' : '0.5s'} linear infinite`,
            }} />
            <div className="absolute top-0 bottom-0 right-0 w-1.5" style={{
              background: 'repeating-linear-gradient(to bottom, #ef4444 0px, #ef4444 8px, #fbbf24 8px, #fbbf24 16px)',
              animation: `roadScroll ${boosting ? '0.2s' : '0.5s'} linear infinite`,
            }} />

            {/* Obstacles */}
            {obstacles.map(obs => (
              <div
                key={obs.id}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${obs.lane * laneW + laneW / 2}%`,
                  top: `${(obs.row / RACER_ROWS) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {obs.type === 'coin' ? (
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                    <Coin size={20} />
                  </motion.div>
                ) : obs.type === 'itembox' ? (
                  <motion.div animate={{ y: [0, -3, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                    <ItemBox size={24} />
                  </motion.div>
                ) : obs.type === 'banana' ? (
                  <Banana size={20} />
                ) : (
                  <Kart size={26} color={obs.color} />
                )}
              </div>
            ))}

            {/* Shell projectile */}
            {shellFlying && (
              <motion.div
                className="absolute z-20"
                style={{ left: `${playerLane * laneW + laneW / 2}%`, transform: 'translateX(-50%)' }}
                initial={{ bottom: '15%' }}
                animate={{ bottom: '90%' }}
                transition={{ duration: 0.3 }}
              >
                <Shell size={18} color="#10b981" />
              </motion.div>
            )}

            {/* Exhaust particles */}
            {exhaust.map(e => (
              <motion.div
                key={e.id}
                className="absolute z-5 rounded-full"
                style={{
                  left: `${e.x * laneW + laneW / 2}%`,
                  bottom: '6%',
                  width: 4, height: 4,
                  background: boosting ? 'rgba(251,191,36,0.5)' : 'rgba(148,163,184,0.2)',
                  transform: 'translateX(-50%)',
                }}
                initial={{ opacity: 0.8, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: 20, scale: 0.3 }}
                transition={{ duration: 0.5 }}
              />
            ))}

            {/* Player kart */}
            <motion.div
              className="absolute z-20 flex items-center justify-center"
              animate={{
                left: `${playerLane * laneW + laneW / 2}%`,
                rotate: tilt * 12,
              }}
              transition={{ left: { type: 'spring', stiffness: 500, damping: 25 }, rotate: { duration: 0.15 } }}
              style={{
                bottom: '8%',
                transform: 'translateX(-50%)',
                filter: invincible
                  ? 'drop-shadow(0 0 12px rgba(251,191,36,0.6))'
                  : boosting
                    ? 'drop-shadow(0 0 10px rgba(239,68,68,0.5))'
                    : 'drop-shadow(0 0 6px rgba(16,185,129,0.3))',
              }}
            >
              <motion.div
                animate={invincible ? { scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 0.4, repeat: invincible ? Infinity : 0 }}
              >
                <Kart size={34} color={invincible ? '#fbbf24' : boosting ? '#ef4444' : '#10b981'} />
              </motion.div>
            </motion.div>

            {/* Speed display */}
            <div className="absolute bottom-1 right-2 text-[8px] text-white/20 font-mono tabular-nums">
              {kmh} km/h
            </div>
          </motion.div>

          {/* Controls bar */}
          <div className="flex items-center gap-2 mt-2 w-full max-w-[260px]">
            <button onClick={() => moveLane(-1)}
              className="h-11 flex-1 rounded-xl bg-white/[0.06] flex items-center justify-center text-white/60 active:bg-emerald-500/20 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>

            {/* Item button */}
            <button
              onClick={useItem}
              className="h-11 w-14 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: item ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.03)',
                boxShadow: item ? '0 0 15px rgba(251,191,36,0.15)' : 'none',
              }}
            >
              {item === 'mushroom' ? <Mushroom size={22} color="#10b981" /> :
               item === 'star' ? <Star size={22} color="#fbbf24" /> :
               item === 'shell' ? <Shell size={22} /> :
               <span className="text-white/15 text-[10px]">ITEM</span>}
            </button>

            <button onClick={() => moveLane(1)}
              className="h-11 flex-1 rounded-xl bg-white/[0.06] flex items-center justify-center text-white/60 active:bg-emerald-500/20 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME 6: Darts — sleep en gooi zelf!
// ═══════════════════════════════════════════════════════════════
const DART_RINGS = [
  { maxR: 0.06, score: 50, label: 'BULLSEYE!', color: '#fbbf24' },
  { maxR: 0.14, score: 25, label: 'Inner Bull!', color: '#10b981' },
  { maxR: 0.28, score: 15, label: 'Triple!', color: '#ef4444' },
  { maxR: 0.45, score: 10, label: 'Goed!', color: '#10b981' },
  { maxR: 0.65, score: 5, label: 'Buiten ring', color: '#ef4444' },
  { maxR: 0.85, score: 2, label: 'Rand...', color: '#64748b' },
  { maxR: 2.0, score: 0, label: 'Mis!', color: '#1e293b' },
];

// Dart pin SVG for thrown darts
function DartPin({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size * 2.5} viewBox="0 0 10 25" fill="none">
      <polygon points="5,0 3,6 7,6" fill="#94a3b8" />
      <rect x="4" y="6" width="2" height="14" rx="1" fill="#f59e0b" />
      <rect x="2.5" y="18" width="5" height="4" rx="1" fill="#8b5cf6" opacity="0.7" />
      <rect x="3" y="21" width="4" height="3" rx="0.5" fill="#ef4444" opacity="0.5" />
    </svg>
  );
}

function DartsGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const [darts, setDarts] = useState<{ x: number; y: number; score: number }[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [dartsLeft, setDartsLeft] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [throwing, setThrowing] = useState(false);
  const [throwAnim, setThrowAnim] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [lastHitLabel, setLastHitLabel] = useState('');
  const [lastHitScore, setLastHitScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [boardShake, setBoardShake] = useState(false);
  const [wind, setWind] = useState(0); // -1 to 1
  const areaRef = useRef<HTMLDivElement>(null);

  const resetGame = () => {
    setDarts([]);
    setTotalScore(0);
    setDartsLeft(5);
    setGameOver(false);
    setDragging(false);
    setDragStart(null);
    setDragCurrent(null);
    setThrowing(false);
    setThrowAnim(null);
    setLastHitLabel('');
    setLastHitScore(0);
    setShowConfetti(false);
    setBoardShake(false);
    setWind((Math.random() - 0.5) * 0.6);
  };

  useEffect(() => { resetGame(); }, []);

  // Change wind between throws
  useEffect(() => {
    if (!throwing && dartsLeft < 5 && dartsLeft > 0) {
      setWind((Math.random() - 0.5) * (0.4 + (5 - dartsLeft) * 0.1));
    }
  }, [dartsLeft, throwing]);

  const getRelPos = (clientX: number, clientY: number) => {
    if (!areaRef.current) return { x: 0, y: 0 };
    const rect = areaRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    if (throwing || gameOver || dartsLeft <= 0) return;
    const pos = getRelPos(clientX, clientY);
    // Only start drag from bottom throw zone (below board)
    if (pos.y < 0.55) return;
    setDragging(true);
    setDragStart(pos);
    setDragCurrent(pos);
    setLastHitLabel('');
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!dragging) return;
    setDragCurrent(getRelPos(clientX, clientY));
  };

  const handleDragEnd = () => {
    if (!dragging || !dragStart || !dragCurrent) {
      setDragging(false);
      return;
    }

    const dx = dragStart.x - dragCurrent.x;
    const dy = dragStart.y - dragCurrent.y;
    const power = Math.sqrt(dx * dx + dy * dy);

    if (power < 0.05) {
      // Too weak — cancel
      setDragging(false);
      setDragStart(null);
      setDragCurrent(null);
      return;
    }

    setDragging(false);
    setThrowing(true);

    // Calculate where dart lands based on drag direction + power + wind
    const throwAngle = Math.atan2(dy, dx);
    const throwPower = Math.min(power * 2.5, 1.2);

    // Target position: center (0.5, 0.3 board center) offset by throw vector + wind
    const aimX = 0.5 - Math.cos(throwAngle) * (0.5 - throwPower * 0.5) + wind * 0.08;
    const aimY = 0.3 - Math.sin(throwAngle) * (0.5 - throwPower * 0.3);

    // Clamp to board area
    const landX = Math.max(0.05, Math.min(0.95, aimX));
    const landY = Math.max(0.05, Math.min(0.55, aimY));

    // Animate dart flight
    setThrowAnim({
      startX: dragStart.x,
      startY: dragStart.y,
      endX: landX,
      endY: landY,
    });

    setTimeout(() => {
      // Score calculation: distance from board center (0.5, 0.3)
      const distX = landX - 0.5;
      const distY = landY - 0.3;
      const dist = Math.sqrt(distX * distX + distY * distY);

      const ring = DART_RINGS.find(r => dist <= r.maxR) || DART_RINGS[DART_RINGS.length - 1];
      const dartScore = ring.score;

      setDarts(prev => [...prev, { x: landX, y: landY, score: dartScore }]);
      setTotalScore(s => s + dartScore);
      setLastHitLabel(ring.label);
      setLastHitScore(dartScore);
      setThrowAnim(null);
      setBoardShake(true);
      setTimeout(() => setBoardShake(false), 200);

      if (dartScore >= 50) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1200);
      }

      const remaining = dartsLeft - 1;
      setDartsLeft(remaining);

      if (remaining <= 0) {
        const finalTotal = totalScore + dartScore;
        setTimeout(() => {
          setGameOver(true);
          onScore(finalTotal);
          if (finalTotal >= 100) setShowConfetti(true);
        }, 500);
      }

      setThrowing(false);
      setDragStart(null);
      setDragCurrent(null);
    }, 350);
  };

  // Draw power / trajectory
  const dragPower = dragStart && dragCurrent
    ? Math.min(Math.sqrt((dragStart.x - dragCurrent.x) ** 2 + (dragStart.y - dragCurrent.y) ** 2) / 0.4, 1)
    : 0;

  return (
    <div className="relative flex flex-col h-full">
      <Confetti active={showConfetti} />
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-400 font-bold">{totalScore} pts</span>
          {/* Darts remaining */}
          <span className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="transition-all" style={{ opacity: i < dartsLeft ? 1 : 0.2 }}>
                <DartPin size={6} />
              </div>
            ))}
          </span>
        </div>
      </div>

      {/* Wind indicator */}
      {!gameOver && dartsLeft < 5 && dartsLeft > 0 && (
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 px-3 mb-1">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Wind: {wind > 0.1 ? '→' : wind < -0.1 ? '←' : '—'} {Math.abs(wind * 100).toFixed(0)}%</span>
        </div>
      )}

      {gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.6 }}>
            <GameBear size={64} mood={totalScore >= 100 ? 'excited' : totalScore >= 50 ? 'happy' : 'thinking'} />
          </motion.div>
          <p className="text-white font-bold text-xl">
            {totalScore >= 150 ? 'Kampioen!' : totalScore >= 100 ? 'Geweldig!' : totalScore >= 50 ? 'Niet slecht!' : 'Oefenen maar!'}
          </p>
          <div className="flex gap-2 text-xs text-slate-400">
            {darts.map((d, i) => (
              <span key={i} className="px-2 py-1 rounded-lg text-[11px] font-medium" style={{
                background: d.score >= 25 ? 'rgba(251,191,36,0.15)' : d.score >= 10 ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
                color: d.score >= 25 ? '#fbbf24' : d.score >= 10 ? '#10b981' : '#64748b',
              }}>
                {d.score}
              </span>
            ))}
          </div>
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400 font-bold text-3xl">{totalScore} pts</motion.p>
          <button onClick={resetGame} className="mt-3 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 text-white text-sm font-semibold hover:from-amber-400 hover:to-red-400 transition-all shadow-lg shadow-amber-500/20">
            Opnieuw gooien
          </button>
        </div>
      ) : (
        <div
          ref={areaRef}
          className="flex-1 flex flex-col items-center px-3 pb-2 select-none touch-none relative"
          onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
          onMouseUp={handleDragEnd}
          onMouseLeave={() => { if (dragging) handleDragEnd(); }}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => { e.preventDefault(); handleDragMove(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchEnd={handleDragEnd}
        >
          {/* Score popup */}
          <AnimatePresence>
            {lastHitLabel && !throwing && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -5, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute top-2 z-50 text-center pointer-events-none"
              >
                <p className={`font-black text-xl ${lastHitScore >= 25 ? 'text-amber-400' : lastHitScore >= 10 ? 'text-emerald-400' : lastHitScore > 0 ? 'text-slate-300' : 'text-red-400'}`}>
                  {lastHitScore > 0 ? `+${lastHitScore}` : 'Mis!'}
                </p>
                <p className="text-[10px] text-white/40">{lastHitLabel}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dartboard */}
          <motion.div
            className="relative w-full max-w-[220px] aspect-square rounded-full overflow-hidden"
            style={{ background: '#0a0e1a' }}
            animate={boardShake ? { rotate: [0, 1.5, -1.5, 1, 0] } : {}}
            transition={{ duration: 0.2 }}
          >
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              {/* Board background */}
              <circle cx="50" cy="50" r="50" fill="#0f172a" />
              {/* Wire frame sectors */}
              {Array.from({ length: 20 }).map((_, i) => {
                const angle = (i * 18) * Math.PI / 180;
                return (
                  <line key={i}
                    x1={50 + Math.cos(angle) * 4}
                    y1={50 + Math.sin(angle) * 4}
                    x2={50 + Math.cos(angle) * 48}
                    y2={50 + Math.sin(angle) * 48}
                    stroke="rgba(255,255,255,0.04)" strokeWidth="0.3"
                  />
                );
              })}
              {/* Scoring rings */}
              <circle cx="50" cy="50" r="43" fill="none" stroke="#ef4444" strokeWidth="8" opacity="0.12" />
              <circle cx="50" cy="50" r="33" fill="none" stroke="#10b981" strokeWidth="8" opacity="0.12" />
              <circle cx="50" cy="50" r="23" fill="none" stroke="#ef4444" strokeWidth="8" opacity="0.15" />
              <circle cx="50" cy="50" r="14" fill="none" stroke="#10b981" strokeWidth="6" opacity="0.15" />
              <circle cx="50" cy="50" r="7" fill="#10b981" opacity="0.2" />
              <circle cx="50" cy="50" r="3.5" fill="#fbbf24" opacity="0.5" />
              <circle cx="50" cy="50" r="1.5" fill="white" opacity="0.6" />
              {/* Wire rings */}
              {[48, 43, 38, 33, 28, 23, 18, 14, 10, 7, 3.5].map((r, i) => (
                <circle key={i} cx="50" cy="50" r={r} fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="0.3" />
              ))}
              {/* Score labels */}
              <text x="50" y="6" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="3">2</text>
              <text x="50" y="16" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="3">5</text>
              <text x="50" y="26" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="3">10</text>
              <text x="50" y="36" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="3">15</text>
              <text x="50" y="44" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="2.5">25</text>
              <text x="50" y="52" textAnchor="middle" fill="rgba(251,191,36,0.3)" fontSize="2.5">50</text>
            </svg>

            {/* Thrown darts */}
            {darts.map((dart, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                className="absolute z-20 pointer-events-none"
                style={{
                  left: `${dart.x * 100}%`,
                  top: `${dart.y * 100}%`,
                  transform: 'translate(-50%, -80%)',
                }}
              >
                <DartPin size={8} />
              </motion.div>
            ))}

            {/* Flying dart animation */}
            {throwAnim && (
              <motion.div
                className="absolute z-30 pointer-events-none"
                initial={{
                  left: `${throwAnim.startX * 100}%`,
                  top: `${throwAnim.startY * 100}%`,
                  scale: 1.5,
                  opacity: 0.6,
                }}
                animate={{
                  left: `${throwAnim.endX * 100}%`,
                  top: `${throwAnim.endY * 100}%`,
                  scale: 1,
                  opacity: 1,
                }}
                transition={{ duration: 0.3, ease: [0.2, 0, 0.2, 1] }}
                style={{ transform: 'translate(-50%, -80%)' }}
              >
                <DartPin size={10} />
              </motion.div>
            )}
          </motion.div>

          {/* Throw zone */}
          <div className="flex-1 w-full max-w-[220px] relative flex flex-col items-center justify-center mt-2">
            {/* Drag trajectory preview */}
            {dragging && dragStart && dragCurrent && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-40" style={{ overflow: 'visible' }}>
                <line
                  x1={`${dragStart.x * 100}%`}
                  y1={`${(dragStart.y - 0.55) / 0.45 * 100}%`}
                  x2={`${dragCurrent.x * 100}%`}
                  y2={`${(dragCurrent.y - 0.55) / 0.45 * 100}%`}
                  stroke="rgba(239,68,68,0.4)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                {/* Arrow tip */}
                <circle
                  cx={`${dragCurrent.x * 100}%`}
                  cy={`${(dragCurrent.y - 0.55) / 0.45 * 100}%`}
                  r="4"
                  fill="rgba(239,68,68,0.5)"
                />
              </svg>
            )}

            {/* Power meter */}
            {dragging && (
              <div className="absolute top-0 left-0 right-0 flex items-center gap-2 px-2">
                <span className="text-[9px] text-slate-500">Kracht</span>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width: `${dragPower * 100}%`,
                      background: dragPower > 0.7 ? '#ef4444' : dragPower > 0.4 ? '#f59e0b' : '#10b981',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Hand / dart ready indicator */}
            {!throwing && !dragging && (
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex flex-col items-center gap-1"
              >
                <DartPin size={16} />
                <p className="text-slate-500 text-[10px] mt-1">
                  Sleep omhoog om te gooien!
                </p>
              </motion.div>
            )}

            {dragging && (
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 1.1 }}
                className="text-[10px] text-amber-400/60 font-medium"
              >
                Laat los om te gooien!
              </motion.div>
            )}
          </div>

          {/* Score legend */}
          <div className="flex gap-1.5 text-[8px] text-slate-600 mt-1">
            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400/50" /> 50</span>
            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/30" /> 25</span>
            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500/25" /> 15</span>
            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" /> 10</span>
            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500/15" /> 5</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME 7: Blackjack — met Mario-thema kaarten
// ═══════════════════════════════════════════════════════════════
// Card suits with game characters
const SUITS = ['♠', '♥', '♦', '♣'] as const;
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

function cardValue(rank: string): number {
  if (rank === 'A') return 11;
  if (['K', 'Q', 'J'].includes(rank)) return 10;
  return parseInt(rank);
}

function handValue(hand: { rank: string; suit: string }[]): number {
  let total = hand.reduce((s, c) => s + cardValue(c.rank), 0);
  let aces = hand.filter(c => c.rank === 'A').length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

// Mario-themed card face
function GameCard({ rank, suit, faceDown = false, small = false }: { rank: string; suit: string; faceDown?: boolean; small?: boolean }) {
  const w = small ? 44 : 56;
  const h = small ? 64 : 80;
  const isRed = suit === '♥' || suit === '♦';
  const color = isRed ? '#ef4444' : '#1e293b';

  if (faceDown) {
    return (
      <div className="rounded-lg overflow-hidden shadow-lg" style={{ width: w, height: h, background: '#1e40af' }}>
        <div className="w-full h-full flex items-center justify-center" style={{
          background: 'repeating-conic-gradient(#1e40af 0% 25%, #2563eb 0% 50%) 50% / 12px 12px',
        }}>
          <div className="w-6 h-6 rounded bg-amber-400 flex items-center justify-center text-xs font-black text-amber-800">?</div>
        </div>
      </div>
    );
  }

  // Character for face cards
  const faceChar = rank === 'J' ? <Mushroom size={small ? 18 : 24} color="#ef4444" /> :
                   rank === 'Q' ? <Star size={small ? 18 : 24} color="#f59e0b" /> :
                   rank === 'K' ? <Ghost size={small ? 18 : 24} color="#8b5cf6" /> :
                   rank === 'A' ? <GameBear size={small ? 18 : 24} mood="excited" /> : null;

  return (
    <div className="rounded-lg overflow-hidden shadow-lg relative" style={{ width: w, height: h, background: 'white' }}>
      {/* Top-left rank + suit */}
      <div className="absolute top-1 left-1.5 flex flex-col items-center leading-none">
        <span className="font-bold" style={{ fontSize: small ? 10 : 13, color }}>{rank}</span>
        <span style={{ fontSize: small ? 8 : 11, color }}>{suit}</span>
      </div>
      {/* Center */}
      <div className="absolute inset-0 flex items-center justify-center">
        {faceChar || (
          <span className="font-bold" style={{ fontSize: small ? 16 : 22, color }}>{suit}</span>
        )}
      </div>
      {/* Bottom-right (rotated) */}
      <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180">
        <span className="font-bold" style={{ fontSize: small ? 10 : 13, color }}>{rank}</span>
        <span style={{ fontSize: small ? 8 : 11, color }}>{suit}</span>
      </div>
    </div>
  );
}

// Blackjack card icon for menu
function CardIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="14" height="18" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="0.5" />
      <text x="5" y="11" fill="#1e293b" fontSize="6" fontWeight="bold">A</text>
      <text x="5" y="17" fill="#1e293b" fontSize="5">♠</text>
      <rect x="8" y="3" width="14" height="18" rx="2" fill="#1e40af" />
      <rect x="12" y="8" width="6" height="6" rx="1" fill="#fbbf24" />
      <text x="15" y="13" textAnchor="middle" fill="#92400e" fontSize="5" fontWeight="bold">?</text>
    </svg>
  );
}

function BlackjackGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const [deck, setDeck] = useState<{ rank: string; suit: string }[]>([]);
  const [playerHand, setPlayerHand] = useState<{ rank: string; suit: string }[]>([]);
  const [dealerHand, setDealerHand] = useState<{ rank: string; suit: string }[]>([]);
  const [phase, setPhase] = useState<'bet' | 'play' | 'dealer' | 'result'>('bet');
  const [bet, setBet] = useState(25);
  const [chips, setChips] = useState(100);
  const [result, setResult] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [roundsWon, setRoundsWon] = useState(0);
  const [streak, setStreak] = useState(0);

  const createDeck = useCallback(() => {
    const d: { rank: string; suit: string }[] = [];
    for (const suit of SUITS) for (const rank of RANKS) d.push({ rank, suit });
    // Shuffle
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  }, []);

  const deal = useCallback(() => {
    let d = deck.length < 15 ? createDeck() : [...deck];
    const p = [d.pop()!, d.pop()!];
    const dl = [d.pop()!, d.pop()!];
    setDeck(d);
    setPlayerHand(p);
    setDealerHand(dl);
    setPhase('play');
    setResult('');

    // Check blackjack
    if (handValue(p) === 21) {
      setTimeout(() => {
        setPhase('result');
        if (handValue(dl) === 21) {
          setResult('Push! Beide Blackjack');
        } else {
          setResult('BLACKJACK! 🎉');
          setChips(c => c + Math.floor(bet * 1.5));
          setRoundsWon(w => w + 1);
          setStreak(s => s + 1);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 1500);
        }
      }, 500);
    }
  }, [deck, createDeck, bet]);

  useEffect(() => {
    setDeck(createDeck());
  }, [createDeck]);

  const hit = () => {
    if (phase !== 'play') return;
    const d = [...deck];
    const card = d.pop()!;
    setDeck(d);
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    if (handValue(newHand) > 21) {
      setPhase('result');
      setResult('Bust! Je hebt verloren');
      setChips(c => c - bet);
      setStreak(0);
    }
  };

  const stand = () => {
    if (phase !== 'play') return;
    setPhase('dealer');

    // Dealer draws
    let d = [...deck];
    const dHand = [...dealerHand];

    const dealerPlay = () => {
      if (handValue(dHand) < 17) {
        dHand.push(d.pop()!);
        setDealerHand([...dHand]);
        setDeck([...d]);
        setTimeout(dealerPlay, 500);
      } else {
        // Determine winner
        const pVal = handValue(playerHand);
        const dVal = handValue(dHand);
        setPhase('result');

        if (dVal > 21) {
          setResult('Dealer bust! Gewonnen!');
          setChips(c => c + bet);
          setRoundsWon(w => w + 1);
          setStreak(s => s + 1);
        } else if (pVal > dVal) {
          setResult('Gewonnen! 🎉');
          setChips(c => c + bet);
          setRoundsWon(w => w + 1);
          setStreak(s => s + 1);
          if (streak >= 2) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 1200);
          }
        } else if (pVal < dVal) {
          setResult('Verloren!');
          setChips(c => c - bet);
          setStreak(0);
        } else {
          setResult('Push! Gelijkspel');
        }
      }
    };
    setTimeout(dealerPlay, 500);
  };

  const doubleDown = () => {
    if (phase !== 'play' || playerHand.length !== 2 || chips < bet) return;
    setBet(b => b * 2);
    const d = [...deck];
    const card = d.pop()!;
    setDeck(d);
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);

    if (handValue(newHand) > 21) {
      setPhase('result');
      setResult('Bust! Verloren');
      setChips(c => c - bet * 2);
      setStreak(0);
    } else {
      // Auto-stand after double
      setTimeout(() => stand(), 300);
    }
  };

  const newRound = () => {
    if (chips <= 0) {
      // Game over — report score
      onScore(roundsWon * 50 + streak * 25);
      setChips(100);
      setRoundsWon(0);
      setStreak(0);
    }
    setBet(Math.min(25, chips));
    deal();
  };

  const pVal = handValue(playerHand);
  const dVal = handValue(dealerHand);
  const showDealer = phase === 'result' || phase === 'dealer';

  return (
    <div className="relative flex flex-col h-full">
      <Confetti active={showConfetti} />
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-amber-400 font-bold">{chips} <span className="text-[8px]">chips</span></span>
          {streak >= 2 && <span className="text-emerald-400 animate-pulse">🔥 x{streak}</span>}
          <span className="text-cyan-400">{roundsWon}W</span>
        </div>
      </div>

      {phase === 'bet' ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <GameBear size={56} mood="thinking" />
          <p className="text-white font-bold text-xl">Blackjack</p>
          <p className="text-slate-400 text-xs text-center">Dichtbij 21, maar ga er niet overheen!</p>

          {/* Bet selector */}
          <div className="flex items-center gap-3 mt-2">
            {[10, 25, 50].map(b => (
              <button
                key={b}
                onClick={() => setBet(Math.min(b, chips))}
                className="h-10 w-14 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: bet === b ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.04)',
                  color: bet === b ? '#fbbf24' : '#64748b',
                  boxShadow: bet === b ? '0 0 12px rgba(251,191,36,0.1)' : 'none',
                }}
                disabled={b > chips}
              >
                {b}
              </button>
            ))}
          </div>
          <p className="text-slate-600 text-[10px]">Inzet: {bet} chips</p>

          <button onClick={deal} className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20">
            Delen!
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col px-3 pb-2">
          {/* Dealer area */}
          <div className="text-center mb-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Dealer {showDealer ? `— ${dVal}` : ''}</span>
          </div>
          <div className="flex justify-center gap-1.5 mb-3 min-h-[68px]">
            {dealerHand.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -20, rotateY: 180 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ delay: i * 0.15, duration: 0.3 }}
              >
                <GameCard rank={card.rank} suit={card.suit} faceDown={i === 1 && !showDealer} small />
              </motion.div>
            ))}
          </div>

          {/* Table felt */}
          <div className="flex-1 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-xl" style={{ background: 'radial-gradient(ellipse at center, rgba(16,100,60,0.15), transparent)' }} />
            {/* Bet display */}
            <div className="absolute top-1 text-[10px] text-amber-400/50">Inzet: {bet}</div>

            {/* Result */}
            {phase === 'result' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute z-30 text-center"
              >
                <p className={`font-black text-lg ${result.includes('Gewonnen') || result.includes('BLACKJACK') ? 'text-emerald-400' : result.includes('Push') ? 'text-amber-400' : 'text-red-400'}`}>
                  {result}
                </p>
              </motion.div>
            )}
          </div>

          {/* Player area */}
          <div className="text-center mb-1">
            <span className={`text-[10px] uppercase tracking-wider ${pVal > 21 ? 'text-red-400' : pVal === 21 ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
              Jij — {pVal} {pVal === 21 && playerHand.length === 2 ? '★ BJ' : ''}
            </span>
          </div>
          <div className="flex justify-center gap-1.5 mb-2 min-h-[68px]">
            {playerHand.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
              >
                <GameCard rank={card.rank} suit={card.suit} small />
              </motion.div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {phase === 'play' ? (
              <>
                <button onClick={hit}
                  className="flex-1 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 active:scale-95 transition-all">
                  Hit
                </button>
                <button onClick={stand}
                  className="flex-1 h-10 rounded-xl bg-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/30 active:scale-95 transition-all">
                  Stand
                </button>
                {playerHand.length === 2 && chips >= bet && (
                  <button onClick={doubleDown}
                    className="flex-1 h-10 rounded-xl bg-purple-500/20 text-purple-400 text-xs font-bold hover:bg-purple-500/30 active:scale-95 transition-all">
                    2x
                  </button>
                )}
              </>
            ) : phase === 'result' ? (
              <button onClick={newRound}
                className="flex-1 h-10 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 text-xs font-bold hover:from-emerald-500/30 hover:to-teal-500/30 active:scale-95 transition-all">
                {chips <= 0 ? 'Opnieuw (100 chips)' : 'Volgende ronde'}
              </button>
            ) : (
              <div className="flex-1 h-10 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Coin size={20} />
                </motion.div>
              </div>
            )}
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
  { id: 'racer' as GameId, name: 'Kart', color: '#f97316', desc: 'Race met items!', icon: (s: number) => <Kart size={s} color="#f97316" /> },
  { id: 'darts' as GameId, name: 'Darts', color: '#ec4899', desc: 'Gooi raak!', icon: (s: number) => <Dartboard size={s} /> },
  { id: 'blackjack' as GameId, name: '21', color: '#0ea5e9', desc: 'Blackjack!', icon: (s: number) => <CardIcon size={s} /> },
];

// ═══════════════════════════════════════════════════════════════
// MAIN WIDGET
// ═══════════════════════════════════════════════════════════════
export default function MiniGames() {
  const [open, setOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState<GameId>('menu');
  const [scores, setScores] = useState<HighScores>({ memory: 0, snake: 0, whack: 0, speed: 0, racer: 0, darts: 0, blackjack: 0 });
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
                    className="p-3 h-full overflow-y-auto"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {/* Mascot header */}
                    <div className="flex items-center justify-center gap-3 mb-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <GameBear size={28} mood="playing" />
                      <div className="text-center">
                        <p className="text-white/70 text-[10px] font-medium">
                          {Object.values(scores).reduce((a, b) => a + b, 0)} pts totaal
                        </p>
                        <p className="text-slate-600 text-[9px]">7 games beschikbaar</p>
                      </div>
                      <GameBear size={28} mood="excited" />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {GAMES.map((game, i) => (
                        <motion.button
                          key={game.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => setCurrentGame(game.id)}
                          className="relative rounded-xl p-2.5 flex flex-col items-center gap-1 text-center transition-all duration-300 group hover:scale-[1.04] active:scale-95"
                          style={{ background: `${game.color}10` }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: [0, -8, 8, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            {game.icon(30)}
                          </motion.div>
                          <span className="text-white font-semibold text-[11px] leading-tight">{game.name}</span>
                          <span className="text-slate-500 text-[9px] leading-tight">{game.desc}</span>
                          {scores[game.id as keyof HighScores] > 0 && (
                            <span className="text-[9px] font-bold" style={{ color: game.color }}>
                              {scores[game.id as keyof HighScores]}
                            </span>
                          )}
                          <div
                            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{ boxShadow: `inset 0 0 0 1px ${game.color}25, 0 0 15px ${game.color}08` }}
                          />
                        </motion.button>
                      ))}
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
                {currentGame === 'blackjack' && (
                  <motion.div key="blackjack" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                    <BlackjackGame onBack={goToMenu} onScore={handleScore('blackjack')} />
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
