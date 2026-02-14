'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ──────────────────────────────────────────────────
type GameId = 'menu' | 'blackjack' | 'darts' | 'bowling';

interface HighScores {
  blackjack: number;
  darts: number;
  bowling: number;
}

const STORAGE_KEY = 'gameshop-minigames';

function loadScores(): HighScores {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    if (d) {
      const p = JSON.parse(d);
      return { blackjack: p.blackjack || 0, darts: p.darts || 0, bowling: p.bowling || 0 };
    }
    return { blackjack: 0, darts: 0, bowling: 0 };
  } catch { return { blackjack: 0, darts: 0, bowling: 0 }; }
}

function saveScore(game: keyof HighScores, score: number) {
  const scores = loadScores();
  if (score > scores[game]) {
    scores[game] = score;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(scores)); } catch {}
  }
  return scores;
}

// ─── Enhanced Confetti ──────────────────────────────────────
function Confetti({ active, intensity = 'normal' }: { active: boolean; intensity?: 'normal' | 'epic' }) {
  if (!active) return null;
  const count = intensity === 'epic' ? 45 : 24;
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: -(Math.random() * 220 + 60),
    r: Math.random() * 720,
    color: ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#0ea5e9', '#ec4899', '#fbbf24', '#14b8a6'][i % 8],
    size: 3 + Math.random() * 6,
    shape: i % 3,
    delay: Math.random() * 0.3,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            width: p.size,
            height: p.shape === 1 ? p.size * 0.4 : p.size,
            background: p.color,
            borderRadius: p.shape === 0 ? '50%' : p.shape === 2 ? '2px' : '1px',
            left: '50%', top: '50%',
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 0 }}
          animate={{ x: p.x, y: p.y, rotate: p.r, opacity: 0, scale: [0, 1.5, 1] }}
          transition={{ duration: 1.2 + Math.random() * 0.5, ease: 'easeOut', delay: p.delay }}
        />
      ))}
    </div>
  );
}

// ─── Fun teksten ────────────────────────────────────────────
function pick(arr: readonly string[]) { return arr[Math.floor(Math.random() * arr.length)]; }

const BJ_WIN = ['Ka-ching! 💰', 'Gewonnen! 🎉', 'De dealer huilt! 😭', 'Easy money! 😎', 'Jij bent de baas! 👑'] as const;
const BJ_LOSE = ['Oeps... 💸', 'Net niet! 🤏', 'De bank wint weer 🏦', 'Morgen beter! 🤞', 'Auw! 🤕'] as const;
const BJ_PUSH = ['Gelijkspel! 🤝', 'Remise!', 'Onbeslist... 😐'] as const;
const BJ_21 = ['BLACKJACK! 🃏✨', '21! PERFECT! 🎉', 'BLACKJACK! 👑'] as const;
const BJ_BUST = ['BUST! 💥', 'Te veel! 💀', 'Over de 21! 💥'] as const;
const BJ_DBUST = ['Dealer bust! 🎉', 'Dealer kapot! 💪', 'Dealer over 21! 🥳'] as const;

const D_BULL = ['BULLSEYE! 🎯🔥', 'Recht in de roos! 🎯', 'Legendarisch! 🏆'] as const;
const D_GOOD = ['Mooi schot! ✨', 'Netjes! 👌', 'Lekker! 🎯'] as const;
const D_OK = ['Gaat! 👍', 'Niet slecht!', 'Kan slechter!'] as const;
const D_MISS = ['Mis! 😅', 'De muur! 😂', 'Was dat een worp? 🤔'] as const;

const B_STRIKE = ['STRIKE! 🎳💥', 'ALLE TIEN! 💥', 'Perfecte worp! 🔥'] as const;
const B_GOOD = ['Goeie worp! 💪', 'Lekker bezig! 🎳', 'Mooi! ✨'] as const;
const B_GUTTER = ['Gutter ball... 😬', 'De goot! 😅', 'Oeps, ernaast! 🤭'] as const;

// ─── SVG Characters ─────────────────────────────────────────
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
      <circle cx="7" cy="10" r="5" fill="#8B6914" />
      <circle cx="7" cy="10" r="3.5" fill="#D4A76A" />
      <circle cx="7" cy="10" r="2" fill="#E8C088" />
      <circle cx="27" cy="10" r="5" fill="#8B6914" />
      <circle cx="27" cy="10" r="3.5" fill="#D4A76A" />
      <circle cx="27" cy="10" r="2" fill="#E8C088" />
      <ellipse cx="10" cy="20" rx="2.5" ry="1.5" fill="rgba(255,150,150,0.25)" />
      <ellipse cx="24" cy="20" rx="2.5" ry="1.5" fill="rgba(255,150,150,0.25)" />
      <circle cx="13" cy="16" r={2 * eyeScale} fill="#2D1B00" />
      <circle cx="21" cy="16" r={2 * eyeScale} fill="#2D1B00" />
      <circle cx="13.5" cy="15.3" r={0.7 * eyeScale} fill="white" />
      <circle cx="21.5" cy="15.3" r={0.7 * eyeScale} fill="white" />
      <path d={mouthPaths[mood]} stroke="#2D1B00" strokeWidth="1.5" strokeLinecap="round" fill={mood === 'excited' ? '#2D1B00' : 'none'} />
      <ellipse cx="17" cy="18" rx="2.5" ry="2" fill="#D4A76A" />
      <circle cx="17" cy="17.5" r="1.2" fill="#2D1B00" />
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

// ─── Dartboard icon ─────────────────────────────────────────
function Dartboard({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#1e293b" />
      <circle cx="12" cy="12" r="10" fill="#ef4444" />
      <circle cx="12" cy="12" r="7.5" fill="#0f766e" />
      <circle cx="12" cy="12" r="5" fill="#ef4444" />
      <circle cx="12" cy="12" r="2.5" fill="#0f766e" />
      <circle cx="12" cy="12" r="1.2" fill="#fbbf24" />
      <line x1="12" y1="1" x2="12" y2="23" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
      <line x1="1" y1="12" x2="23" y2="12" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
      <g transform="translate(14, 7) rotate(30)">
        <rect x="0" y="0" width="1.5" height="7" rx="0.5" fill="#f59e0b" />
        <polygon points="0.75,-1.5 -0.5,0.5 2,0.5" fill="#94a3b8" />
        <rect x="-0.5" y="5.5" width="2.5" height="1.5" rx="0.5" fill="#8b5cf6" opacity="0.7" />
      </g>
    </svg>
  );
}

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

// ─── Blackjack card components ──────────────────────────────
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

function GameCard({ rank, suit, faceDown = false, small = false }: { rank: string; suit: string; faceDown?: boolean; small?: boolean }) {
  const w = small ? 46 : 58;
  const h = small ? 66 : 82;
  const isRed = suit === '♥' || suit === '♦';
  const color = isRed ? '#ef4444' : '#1e293b';

  if (faceDown) {
    return (
      <div className="rounded-lg overflow-hidden" style={{
        width: w, height: h,
        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
        boxShadow: '0 4px 15px rgba(30,64,175,0.4)',
      }}>
        <div className="w-full h-full flex items-center justify-center" style={{
          background: 'repeating-conic-gradient(#1e40af 0% 25%, #2563eb 0% 50%) 50% / 10px 10px',
        }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            boxShadow: '0 2px 8px rgba(251,191,36,0.4)',
          }}>
            <span className="text-amber-800 font-black text-xs">?</span>
          </div>
        </div>
      </div>
    );
  }

  const faceChar = rank === 'J' ? <Mushroom size={small ? 20 : 26} color="#ef4444" /> :
                   rank === 'Q' ? <Star size={small ? 20 : 26} color="#f59e0b" /> :
                   rank === 'K' ? <Ghost size={small ? 20 : 26} color="#8b5cf6" /> :
                   rank === 'A' ? <GameBear size={small ? 20 : 26} mood="excited" /> : null;

  return (
    <div className="rounded-lg overflow-hidden relative" style={{
      width: w, height: h,
      background: 'linear-gradient(180deg, #ffffff, #f8fafc)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
    }}>
      <div className="absolute top-1 left-1.5 flex flex-col items-center leading-none">
        <span className="font-black" style={{ fontSize: small ? 11 : 14, color }}>{rank}</span>
        <span style={{ fontSize: small ? 9 : 12, color }}>{suit}</span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        {faceChar || (
          <span className="font-bold" style={{ fontSize: small ? 18 : 24, color }}>{suit}</span>
        )}
      </div>
      <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180">
        <span className="font-black" style={{ fontSize: small ? 11 : 14, color }}>{rank}</span>
        <span style={{ fontSize: small ? 9 : 12, color }}>{suit}</span>
      </div>
    </div>
  );
}

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

// ─── Bowling icon ───────────────────────────────────────────
function BowlingIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="16" r="6.5" fill="url(#bowlGrad)" />
      <defs><radialGradient id="bowlGrad" cx="40%" cy="35%"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#6d28d9" /></radialGradient></defs>
      <circle cx="7.5" cy="14" r="0.9" fill="#4c1d95" />
      <circle cx="9.5" cy="13" r="0.9" fill="#4c1d95" />
      <circle cx="8" cy="15.5" r="0.9" fill="#4c1d95" />
      <ellipse cx="7" cy="14.5" rx="2" ry="2.5" fill="white" opacity="0.12" />
      <ellipse cx="18" cy="12" rx="3" ry="2" fill="white" />
      <rect x="16" y="6" width="4" height="7" rx="2" fill="white" />
      <circle cx="18" cy="4.5" r="2.5" fill="white" />
      <ellipse cx="18" cy="9.5" rx="2" ry="1" fill="#ef4444" opacity="0.5" />
      <ellipse cx="18" cy="11" rx="2.5" ry="0.8" fill="#ef4444" opacity="0.3" />
      <ellipse cx="17" cy="4" rx="0.8" ry="1.2" fill="white" opacity="0.5" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME: DARTS — sleep en gooi zelf!
// ═══════════════════════════════════════════════════════════════
const DART_RINGS = [
  { maxR: 0.055, score: 50, label: 'BULLSEYE!', texts: D_BULL },
  { maxR: 0.13, score: 25, label: 'Inner Bull!', texts: D_GOOD },
  { maxR: 0.26, score: 15, label: 'Triple!', texts: D_GOOD },
  { maxR: 0.42, score: 10, label: 'Goed!', texts: D_OK },
  { maxR: 0.60, score: 5, label: 'Buitenring', texts: D_OK },
  { maxR: 0.80, score: 2, label: 'Rand...', texts: D_MISS },
  { maxR: 2.0, score: 0, label: 'Mis!', texts: D_MISS },
];

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
  const [message, setMessage] = useState('');
  const [lastScore, setLastScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [boardShake, setBoardShake] = useState(false);
  const [wind, setWind] = useState(0);
  const [boardPulse, setBoardPulse] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  const resetGame = () => {
    setDarts([]); setTotalScore(0); setDartsLeft(5); setGameOver(false);
    setDragging(false); setDragStart(null); setDragCurrent(null);
    setThrowing(false); setThrowAnim(null);
    setMessage(''); setLastScore(0); setShowConfetti(false);
    setBoardShake(false); setBoardPulse(false);
    setWind((Math.random() - 0.5) * 0.6);
  };

  useEffect(() => { resetGame(); }, []);

  useEffect(() => {
    if (!throwing && dartsLeft < 5 && dartsLeft > 0) {
      setWind((Math.random() - 0.5) * (0.4 + (5 - dartsLeft) * 0.1));
    }
  }, [dartsLeft, throwing]);

  const getRelPos = (clientX: number, clientY: number) => {
    if (!areaRef.current) return { x: 0, y: 0 };
    const rect = areaRef.current.getBoundingClientRect();
    return { x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / rect.height };
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    if (throwing || gameOver || dartsLeft <= 0) return;
    const pos = getRelPos(clientX, clientY);
    if (pos.y < 0.55) return;
    setDragging(true); setDragStart(pos); setDragCurrent(pos); setMessage('');
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!dragging) return;
    setDragCurrent(getRelPos(clientX, clientY));
  };

  const handleDragEnd = () => {
    if (!dragging || !dragStart || !dragCurrent) { setDragging(false); return; }
    const dx = dragStart.x - dragCurrent.x;
    const dy = dragStart.y - dragCurrent.y;
    const power = Math.sqrt(dx * dx + dy * dy);
    if (power < 0.05) { setDragging(false); setDragStart(null); setDragCurrent(null); return; }

    setDragging(false); setThrowing(true);
    const throwAngle = Math.atan2(dy, dx);
    const throwPower = Math.min(power * 2.5, 1.2);
    const aimX = 0.5 - Math.cos(throwAngle) * (0.5 - throwPower * 0.5) + wind * 0.08;
    const aimY = 0.3 - Math.sin(throwAngle) * (0.5 - throwPower * 0.3);
    const landX = Math.max(0.05, Math.min(0.95, aimX));
    const landY = Math.max(0.05, Math.min(0.55, aimY));

    setThrowAnim({ startX: dragStart.x, startY: dragStart.y, endX: landX, endY: landY });

    setTimeout(() => {
      const distX = landX - 0.5;
      const distY = landY - 0.3;
      const dist = Math.sqrt(distX * distX + distY * distY);
      const ring = DART_RINGS.find(r => dist <= r.maxR) || DART_RINGS[DART_RINGS.length - 1];
      const dartScore = ring.score;

      setDarts(prev => [...prev, { x: landX, y: landY, score: dartScore }]);
      setTotalScore(s => s + dartScore);
      setMessage(pick(ring.texts));
      setLastScore(dartScore);
      setThrowAnim(null);
      setBoardShake(true);
      setTimeout(() => setBoardShake(false), 250);

      if (dartScore >= 50) {
        setShowConfetti(true); setBoardPulse(true);
        setTimeout(() => { setShowConfetti(false); setBoardPulse(false); }, 1500);
      }

      const remaining = dartsLeft - 1;
      setDartsLeft(remaining);
      if (remaining <= 0) {
        const finalTotal = totalScore + dartScore;
        setTimeout(() => {
          setGameOver(true); onScore(finalTotal);
          if (finalTotal >= 100) setShowConfetti(true);
        }, 600);
      }
      setThrowing(false); setDragStart(null); setDragCurrent(null);
    }, 350);
  };

  const dragPower = dragStart && dragCurrent
    ? Math.min(Math.sqrt((dragStart.x - dragCurrent.x) ** 2 + (dragStart.y - dragCurrent.y) ** 2) / 0.4, 1)
    : 0;

  return (
    <div className="relative flex flex-col h-full" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(15,23,42,0.3), transparent)' }}>
      <Confetti active={showConfetti} intensity={totalScore >= 150 ? 'epic' : 'normal'} />
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-400 font-bold text-sm">{totalScore} <span className="text-[9px] text-emerald-400/60">pts</span></span>
          <span className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="transition-all" style={{ opacity: i < dartsLeft ? 1 : 0.15, transform: i < dartsLeft ? 'scale(1)' : 'scale(0.8)' }}>
                <DartPin size={5} />
              </div>
            ))}
          </span>
        </div>
      </div>

      {/* Wind */}
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
          <motion.div animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 0.8 }}>
            <GameBear size={64} mood={totalScore >= 150 ? 'excited' : totalScore >= 80 ? 'happy' : 'thinking'} />
          </motion.div>
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-white font-black text-xl">
            {totalScore >= 150 ? pick(D_BULL) : totalScore >= 80 ? 'Goed gespeeld! 🎯' : pick(D_MISS)}
          </motion.p>
          <div className="flex gap-2">
            {darts.map((d, i) => (
              <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold" style={{
                  background: d.score >= 25 ? 'rgba(251,191,36,0.15)' : d.score >= 10 ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
                  color: d.score >= 25 ? '#fbbf24' : d.score >= 10 ? '#10b981' : '#64748b',
                }}>
                {d.score}
              </motion.span>
            ))}
          </div>
          <motion.p initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring' }}
            className="text-emerald-400 font-black text-4xl">{totalScore}
          </motion.p>
          <button onClick={resetGame} className="mt-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}>
            Opnieuw gooien
          </button>
        </div>
      ) : (
        <div ref={areaRef} className="flex-1 flex flex-col items-center px-3 pb-2 select-none touch-none relative"
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
            {message && !throwing && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.7 }} animate={{ opacity: 1, y: -8, scale: 1 }}
                exit={{ opacity: 0, y: -25 }} transition={{ duration: 0.6 }}
                className="absolute top-2 z-50 text-center pointer-events-none">
                <p className={`font-black text-lg ${lastScore >= 25 ? 'text-amber-400' : lastScore >= 10 ? 'text-emerald-400' : lastScore > 0 ? 'text-slate-300' : 'text-red-400'}`}>
                  {message}
                </p>
                {lastScore > 0 && <p className="text-[11px] font-bold text-white/50">+{lastScore}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dartboard */}
          <motion.div
            className="relative w-full max-w-[220px] aspect-square rounded-full overflow-hidden"
            style={{ background: '#0a0e1a', boxShadow: boardPulse ? '0 0 40px rgba(251,191,36,0.3)' : '0 0 20px rgba(0,0,0,0.3)' }}
            animate={boardShake ? { rotate: [0, 2, -2, 1, 0] } : {}}
            transition={{ duration: 0.25 }}
          >
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              <circle cx="50" cy="50" r="50" fill="#0f172a" />
              {/* Sector fills — alternating red/green */}
              {Array.from({ length: 20 }).map((_, i) => {
                const a1 = ((i * 18) - 9) * Math.PI / 180;
                const a2 = ((i * 18) + 9) * Math.PI / 180;
                const outerR = 47;
                const innerR = 19;
                const fill = i % 2 === 0 ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.06)';
                return (
                  <path key={i}
                    d={`M${50 + Math.cos(a1) * innerR},${50 + Math.sin(a1) * innerR} L${50 + Math.cos(a1) * outerR},${50 + Math.sin(a1) * outerR} A${outerR},${outerR} 0 0,1 ${50 + Math.cos(a2) * outerR},${50 + Math.sin(a2) * outerR} L${50 + Math.cos(a2) * innerR},${50 + Math.sin(a2) * innerR} A${innerR},${innerR} 0 0,0 ${50 + Math.cos(a1) * innerR},${50 + Math.sin(a1) * innerR}`}
                    fill={fill}
                  />
                );
              })}
              {/* Wire sector lines */}
              {Array.from({ length: 20 }).map((_, i) => {
                const angle = (i * 18) * Math.PI / 180;
                return (
                  <line key={`w${i}`}
                    x1={50 + Math.cos(angle) * 4} y1={50 + Math.sin(angle) * 4}
                    x2={50 + Math.cos(angle) * 48} y2={50 + Math.sin(angle) * 48}
                    stroke="rgba(148,163,184,0.06)" strokeWidth="0.4"
                  />
                );
              })}
              {/* Scoring rings with glow */}
              <circle cx="50" cy="50" r="44" fill="none" stroke="#ef4444" strokeWidth="7" opacity="0.1" />
              <circle cx="50" cy="50" r="34" fill="none" stroke="#10b981" strokeWidth="7" opacity="0.1" />
              <circle cx="50" cy="50" r="24" fill="none" stroke="#ef4444" strokeWidth="7" opacity="0.12" />
              <circle cx="50" cy="50" r="16" fill="none" stroke="#10b981" strokeWidth="5" opacity="0.12" />
              {/* Inner rings */}
              <circle cx="50" cy="50" r="8" fill="#10b981" opacity="0.15" />
              <circle cx="50" cy="50" r="4" fill="#fbbf24" opacity="0.4" />
              <circle cx="50" cy="50" r="2" fill="white" opacity="0.5" />
              {/* Wire circles */}
              {[48, 44, 38, 34, 28, 24, 19, 16, 12, 8, 4].map((r, i) => (
                <circle key={`c${i}`} cx="50" cy="50" r={r} fill="none" stroke="rgba(148,163,184,0.06)" strokeWidth="0.3" />
              ))}
              {/* Score labels */}
              <text x="50" y="5" textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="3">2</text>
              <text x="50" y="15" textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="3">5</text>
              <text x="50" y="27" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="2.8">10</text>
              <text x="50" y="37" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="2.8">15</text>
              <text x="50" y="44" textAnchor="middle" fill="rgba(255,255,255,0.18)" fontSize="2.5">25</text>
              <text x="50" y="52" textAnchor="middle" fill="rgba(251,191,36,0.25)" fontSize="2.5">50</text>
            </svg>

            {/* Thrown darts */}
            {darts.map((dart, i) => (
              <motion.div key={i}
                initial={{ scale: 0, opacity: 0, y: -15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="absolute z-20 pointer-events-none"
                style={{ left: `${dart.x * 100}%`, top: `${dart.y * 100}%`, transform: 'translate(-50%, -80%)' }}
              >
                <DartPin size={8} />
              </motion.div>
            ))}

            {/* Flying dart */}
            {throwAnim && (
              <motion.div className="absolute z-30 pointer-events-none"
                initial={{ left: `${throwAnim.startX * 100}%`, top: `${throwAnim.startY * 100}%`, scale: 1.5, opacity: 0.5 }}
                animate={{ left: `${throwAnim.endX * 100}%`, top: `${throwAnim.endY * 100}%`, scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.2, 0, 0.2, 1] }}
                style={{ transform: 'translate(-50%, -80%)' }}
              >
                <DartPin size={10} />
              </motion.div>
            )}
          </motion.div>

          {/* Throw zone */}
          <div className="flex-1 w-full max-w-[220px] relative flex flex-col items-center justify-center mt-2">
            {dragging && dragStart && dragCurrent && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-40" style={{ overflow: 'visible' }}>
                <line
                  x1={`${dragStart.x * 100}%`} y1={`${(dragStart.y - 0.55) / 0.45 * 100}%`}
                  x2={`${dragCurrent.x * 100}%`} y2={`${(dragCurrent.y - 0.55) / 0.45 * 100}%`}
                  stroke="rgba(239,68,68,0.4)" strokeWidth="2" strokeDasharray="4 4"
                />
                <circle cx={`${dragCurrent.x * 100}%`} cy={`${(dragCurrent.y - 0.55) / 0.45 * 100}%`} r="4" fill="rgba(239,68,68,0.5)" />
              </svg>
            )}

            {dragging && (
              <div className="absolute top-0 left-0 right-0 flex items-center gap-2 px-2">
                <span className="text-[9px] text-slate-500">Kracht</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <motion.div className="h-full rounded-full" style={{
                    width: `${dragPower * 100}%`,
                    background: dragPower > 0.7 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : dragPower > 0.4 ? 'linear-gradient(90deg, #10b981, #f59e0b)' : '#10b981',
                  }} />
                </div>
              </div>
            )}

            {!throwing && !dragging && (
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex flex-col items-center gap-1.5">
                <DartPin size={18} />
                <p className="text-slate-500 text-[10px] mt-1">Sleep omhoog om te gooien!</p>
              </motion.div>
            )}

            {dragging && (
              <motion.p initial={{ scale: 1 }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.5, repeat: Infinity }}
                className="text-[10px] text-amber-400/70 font-bold">
                Laat los om te gooien!
              </motion.p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME: BLACKJACK — casino vibe
// ═══════════════════════════════════════════════════════════════
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
  const [resultColor, setResultColor] = useState('#10b981');

  const createDeck = useCallback(() => {
    const d: { rank: string; suit: string }[] = [];
    for (const suit of SUITS) for (const rank of RANKS) d.push({ rank, suit });
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  }, []);

  const winRound = useCallback((msg: string, multiplier: number = 1) => {
    setResult(msg);
    setResultColor('#10b981');
    setChips(c => c + Math.floor(bet * multiplier));
    setRoundsWon(w => w + 1);
    setStreak(s => s + 1);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
  }, [bet]);

  const loseRound = useCallback((msg: string) => {
    setResult(msg);
    setResultColor('#ef4444');
    setChips(c => c - bet);
    setStreak(0);
  }, [bet]);

  const pushRound = useCallback((msg: string) => {
    setResult(msg);
    setResultColor('#f59e0b');
  }, []);

  const deal = useCallback(() => {
    let d = deck.length < 15 ? createDeck() : [...deck];
    const p = [d.pop()!, d.pop()!];
    const dl = [d.pop()!, d.pop()!];
    setDeck(d); setPlayerHand(p); setDealerHand(dl);
    setPhase('play'); setResult('');

    if (handValue(p) === 21) {
      setTimeout(() => {
        setPhase('result');
        if (handValue(dl) === 21) { pushRound(pick(BJ_PUSH)); }
        else { winRound(pick(BJ_21), 1.5); }
      }, 500);
    }
  }, [deck, createDeck, winRound, pushRound]);

  useEffect(() => { setDeck(createDeck()); }, [createDeck]);

  const hit = () => {
    if (phase !== 'play') return;
    const d = [...deck]; const card = d.pop()!; setDeck(d);
    const newHand = [...playerHand, card]; setPlayerHand(newHand);
    if (handValue(newHand) > 21) {
      setPhase('result'); loseRound(pick(BJ_BUST));
    }
  };

  const stand = useCallback(() => {
    if (phase !== 'play') return;
    setPhase('dealer');
    const d = [...deck]; const dHand = [...dealerHand];
    const pVal = handValue(playerHand);

    const dealerPlay = () => {
      if (handValue(dHand) < 17) {
        dHand.push(d.pop()!);
        setDealerHand([...dHand]); setDeck([...d]);
        setTimeout(dealerPlay, 500);
      } else {
        const dVal = handValue(dHand);
        setPhase('result');
        if (dVal > 21) { winRound(pick(BJ_DBUST)); }
        else if (pVal > dVal) { winRound(pick(BJ_WIN)); }
        else if (pVal < dVal) { loseRound(pick(BJ_LOSE)); }
        else { pushRound(pick(BJ_PUSH)); }
      }
    };
    setTimeout(dealerPlay, 500);
  }, [phase, deck, dealerHand, playerHand, winRound, loseRound, pushRound]);

  const doubleDown = () => {
    if (phase !== 'play' || playerHand.length !== 2 || chips < bet) return;
    setBet(b => b * 2);
    const d = [...deck]; const card = d.pop()!; setDeck(d);
    const newHand = [...playerHand, card]; setPlayerHand(newHand);
    if (handValue(newHand) > 21) {
      setPhase('result'); loseRound(pick(BJ_BUST));
    } else {
      setTimeout(() => stand(), 300);
    }
  };

  const newRound = () => {
    if (chips <= 0) {
      onScore(roundsWon * 50 + streak * 25);
      setChips(100); setRoundsWon(0); setStreak(0);
    }
    setBet(Math.min(25, chips > 0 ? chips : 100));
    deal();
  };

  const pVal = handValue(playerHand);
  const dVal = handValue(dealerHand);
  const showDealer = phase === 'result' || phase === 'dealer';

  return (
    <div className="relative flex flex-col h-full">
      <Confetti active={showConfetti} intensity={streak >= 3 ? 'epic' : 'normal'} />

      {/* Casino felt background */}
      <div className="absolute inset-0 rounded-b-2xl" style={{
        background: 'radial-gradient(ellipse at 50% 60%, rgba(6,78,59,0.15), rgba(5,8,16,0.3))',
      }} />

      {/* Header */}
      <div className="relative flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-3 text-[11px]">
          {/* Chip stack */}
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#92400e' }}>$</div>
            <span className="text-amber-400 font-bold">{chips}</span>
          </div>
          {streak >= 2 && (
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="text-orange-400">
              {'🔥'.repeat(Math.min(streak, 5))}
            </motion.span>
          )}
          <span className="text-cyan-400 text-[10px]">{roundsWon}W</span>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col">
        {phase === 'bet' ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
            <motion.div animate={{ rotate: [0, -3, 3, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}>
              <GameBear size={56} mood="thinking" />
            </motion.div>
            <p className="text-white font-black text-xl">Blackjack</p>
            <p className="text-slate-400 text-xs text-center">Kom zo dicht bij 21 als je kan!</p>

            {/* Bet chips */}
            <div className="flex items-center gap-3 mt-3">
              {[10, 25, 50].map(b => (
                <motion.button key={b} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setBet(Math.min(b, chips))}
                  className="h-12 w-12 rounded-full text-sm font-black transition-all flex items-center justify-center"
                  style={{
                    background: bet === b ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'rgba(255,255,255,0.04)',
                    color: bet === b ? '#92400e' : '#64748b',
                    boxShadow: bet === b ? '0 0 20px rgba(251,191,36,0.3), inset 0 -2px 0 rgba(0,0,0,0.1)' : 'none',
                    border: bet === b ? '2px solid rgba(251,191,36,0.5)' : '2px solid rgba(255,255,255,0.06)',
                  }}
                  disabled={b > chips}
                >
                  {b}
                </motion.button>
              ))}
            </div>
            <p className="text-slate-600 text-[10px]">Inzet: {bet} chips</p>

            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={deal}
              className="mt-3 px-8 py-3 rounded-xl text-white text-sm font-bold transition-all"
              style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
              Delen!
            </motion.button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col px-3 pb-2">
            {/* Dealer */}
            <div className="text-center mb-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                Dealer {showDealer ? <span className="text-white/70">— {dVal}</span> : ''}
              </span>
            </div>
            <div className="flex justify-center gap-2 mb-3 min-h-[70px]">
              {dealerHand.map((card, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: -30, rotateY: 180 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.4, type: 'spring', stiffness: 200 }}
                >
                  <GameCard rank={card.rank} suit={card.suit} faceDown={i === 1 && !showDealer} small />
                </motion.div>
              ))}
            </div>

            {/* Table felt center */}
            <div className="flex-1 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-xl" style={{
                background: 'radial-gradient(ellipse at center, rgba(6,78,59,0.12), transparent)',
              }} />
              <div className="absolute top-1 text-[10px] text-amber-400/40 font-medium">Inzet: {bet}</div>

              {/* Result */}
              {phase === 'result' && (
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="absolute z-30 text-center px-4 py-2 rounded-xl"
                  style={{ background: `${resultColor}15`, boxShadow: `0 0 30px ${resultColor}15` }}
                >
                  <p className="font-black text-lg" style={{ color: resultColor }}>{result}</p>
                </motion.div>
              )}
            </div>

            {/* Player */}
            <div className="text-center mb-1">
              <span className={`text-[10px] uppercase tracking-wider font-medium ${pVal > 21 ? 'text-red-400' : pVal === 21 ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                Jij — {pVal} {pVal === 21 && playerHand.length === 2 ? '★ BJ' : ''}
              </span>
            </div>
            <div className="flex justify-center gap-2 mb-2 min-h-[70px]">
              {playerHand.map((card, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.7, rotateZ: -5 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotateZ: 0 }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
                >
                  <GameCard rank={card.rank} suit={card.suit} small />
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {phase === 'play' ? (
                <>
                  <motion.button whileTap={{ scale: 0.93 }} onClick={hit}
                    className="flex-1 h-11 rounded-xl text-xs font-bold transition-all"
                    style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                    Hit
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.93 }} onClick={stand}
                    className="flex-1 h-11 rounded-xl text-xs font-bold transition-all"
                    style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
                    Stand
                  </motion.button>
                  {playerHand.length === 2 && chips >= bet && (
                    <motion.button whileTap={{ scale: 0.93 }} onClick={doubleDown}
                      className="flex-1 h-11 rounded-xl text-xs font-bold transition-all"
                      style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }}>
                      2x
                    </motion.button>
                  )}
                </>
              ) : phase === 'result' ? (
                <motion.button whileTap={{ scale: 0.93 }} onClick={newRound}
                  className="flex-1 h-11 rounded-xl text-xs font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(20,184,166,0.15))', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {chips <= 0 ? 'Opnieuw (100 chips)' : 'Volgende ronde →'}
                </motion.button>
              ) : (
                <div className="flex-1 h-11 flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <div className="w-5 h-5 rounded-full" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }} />
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME: BOWLING — arcade style
// ═══════════════════════════════════════════════════════════════
const PIN_POSITIONS = [
  { id: 1, x: 0.50, y: 0.36 },
  { id: 2, x: 0.43, y: 0.28 },
  { id: 3, x: 0.57, y: 0.28 },
  { id: 4, x: 0.36, y: 0.20 },
  { id: 5, x: 0.50, y: 0.20 },
  { id: 6, x: 0.64, y: 0.20 },
  { id: 7, x: 0.29, y: 0.12 },
  { id: 8, x: 0.43, y: 0.12 },
  { id: 9, x: 0.57, y: 0.12 },
  { id: 10, x: 0.71, y: 0.12 },
];

interface BowlPin { id: number; x: number; y: number; standing: boolean; fallAngle: number; }

function BowlingGame({ onBack, onScore }: { onBack: () => void; onScore: (s: number) => void }) {
  const [pins, setPins] = useState<BowlPin[]>([]);
  const [aimX, setAimX] = useState(0.5);
  const [throwing, setThrowing] = useState(false);
  const [ballPos, setBallPos] = useState<{ x: number; y: number } | null>(null);
  const [throwsLeft, setThrowsLeft] = useState(5);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastKnocked, setLastKnocked] = useState(0);
  const [impactFlash, setImpactFlash] = useState(false);
  const laneRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef(0);

  const resetPins = useCallback(() => {
    setPins(PIN_POSITIONS.map(p => ({ ...p, standing: true, fallAngle: 0 })));
  }, []);

  const resetGame = useCallback(() => {
    resetPins(); setAimX(0.5); setThrowsLeft(5);
    setScore(0); scoreRef.current = 0;
    setGameOver(false); setBallPos(null); setThrowing(false);
    setMessage(''); setShowConfetti(false); setLastKnocked(0); setImpactFlash(false);
  }, [resetPins]);

  useEffect(() => { resetGame(); }, [resetGame]);

  const handleLaneInteraction = (clientX: number) => {
    if (throwing || gameOver || throwsLeft <= 0) return;
    if (!laneRef.current) return;
    const rect = laneRef.current.getBoundingClientRect();
    const relX = (clientX - rect.left) / rect.width;
    setAimX(Math.max(0.18, Math.min(0.82, relX)));
  };

  const throwBall = useCallback(() => {
    if (throwing || gameOver || throwsLeft <= 0) return;
    setThrowing(true); setMessage('');

    const startX = aimX;
    const startY = 0.88;
    setBallPos({ x: startX, y: startY });

    let frame = 0;
    const totalFrames = 28;
    const anim = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 2);
      const x = startX + (0.5 - startX) * eased * 0.08;
      const y = startY - eased * 0.78;
      setBallPos({ x, y });

      if (frame >= totalFrames) {
        clearInterval(anim);
        setImpactFlash(true);
        setTimeout(() => setImpactFlash(false), 200);

        // Collision detection
        const newPins = pins.map(p => ({ ...p }));
        const fallen = new Set<number>();
        const ballFinalX = x;

        // Direct hits
        for (const pin of newPins) {
          if (!pin.standing) continue;
          const dx = Math.abs(pin.x - ballFinalX);
          if (dx < 0.06) {
            fallen.add(pin.id);
            pin.standing = false;
            pin.fallAngle = (pin.x - ballFinalX) > 0 ? 25 : -25;
          }
        }

        // Chain reactions (3 passes)
        for (let pass = 0; pass < 3; pass++) {
          for (const pin of newPins) {
            if (!pin.standing) continue;
            for (const other of newPins) {
              if (other.standing || other.id === pin.id || !fallen.has(other.id)) continue;
              const dx = pin.x - other.x;
              const dy = pin.y - other.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 0.095 && dy < 0.02 && Math.random() > 0.22) {
                fallen.add(pin.id);
                pin.standing = false;
                pin.fallAngle = dx > 0 ? 20 + Math.random() * 10 : -20 - Math.random() * 10;
              }
            }
          }
        }

        const knocked = fallen.size;
        setPins([...newPins]);
        setLastKnocked(knocked);

        let bonus = 0;
        if (knocked === 10) bonus = 50;
        else if (knocked >= 8) bonus = 20;
        const throwScore = knocked * 10 + bonus;
        const newTotal = scoreRef.current + throwScore;
        scoreRef.current = newTotal;
        setScore(newTotal);

        if (knocked === 10) {
          setMessage(pick(B_STRIKE));
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 1500);
        } else if (knocked >= 7) {
          setMessage(pick(B_GOOD));
        } else if (knocked === 0) {
          setMessage(pick(B_GUTTER));
        } else {
          setMessage(`${knocked} pins! +${throwScore}`);
        }

        const remaining = throwsLeft - 1;
        setThrowsLeft(remaining);

        setTimeout(() => {
          setBallPos(null);
          setThrowing(false);
          if (remaining <= 0) {
            setTimeout(() => { setGameOver(true); onScore(newTotal); }, 400);
          } else {
            setTimeout(() => resetPins(), 200);
          }
        }, 900);
      }
    }, 22);
  }, [throwing, gameOver, throwsLeft, aimX, pins, resetPins, onScore, throwsLeft]);

  return (
    <div className="relative flex flex-col h-full">
      <Confetti active={showConfetti} intensity={lastKnocked === 10 ? 'epic' : 'normal'} />

      {/* Header */}
      <div className="relative flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-400 font-bold text-sm">{score} <span className="text-[9px] text-emerald-400/60">pts</span></span>
          <span className="text-slate-500">{throwsLeft} 🎳</span>
        </div>
      </div>

      {gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <motion.div animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }} transition={{ duration: 0.7 }}>
            <GameBear size={64} mood={score >= 350 ? 'excited' : score >= 200 ? 'happy' : 'thinking'} />
          </motion.div>
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-white font-black text-xl">
            {score >= 400 ? pick(B_STRIKE) : score >= 250 ? 'Goed gespeeld! 🎳' : score >= 150 ? 'Niet slecht!' : 'Oefenen maar! 💪'}
          </motion.p>
          <motion.p initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring' }}
            className="text-emerald-400 font-black text-4xl">{score}
          </motion.p>
          <p className="text-slate-500 text-xs">5 worpen gespeeld</p>
          <button onClick={resetGame} className="mt-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', boxShadow: '0 4px 20px rgba(249,115,22,0.3)' }}>
            Opnieuw bowlen
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col px-3 pb-2">
          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div initial={{ opacity: 0, y: -10, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }} className="text-center mb-1 pointer-events-none">
                <p className={`font-black text-base ${lastKnocked === 10 ? 'text-amber-400' : lastKnocked >= 7 ? 'text-emerald-400' : lastKnocked === 0 ? 'text-red-400/70' : 'text-white/70'}`}>
                  {message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lane */}
          <div ref={laneRef} className="relative flex-1 rounded-xl overflow-hidden cursor-crosshair"
            style={{
              background: 'linear-gradient(180deg, #8B7355 0%, #A0875E 20%, #B8996B 50%, #C4A574 80%, #B8996B 100%)',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => handleLaneInteraction(e.clientX)}
            onMouseMove={(e) => { if (e.buttons === 1) handleLaneInteraction(e.clientX); }}
            onTouchStart={(e) => handleLaneInteraction(e.touches[0].clientX)}
            onTouchMove={(e) => { e.preventDefault(); handleLaneInteraction(e.touches[0].clientX); }}
          >
            {/* Impact flash */}
            {impactFlash && (
              <motion.div initial={{ opacity: 0.6 }} animate={{ opacity: 0 }} transition={{ duration: 0.3 }}
                className="absolute inset-0 z-40" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.4), transparent 60%)' }} />
            )}

            {/* Gutters */}
            <div className="absolute inset-y-0 left-0 w-[13%]" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.35), rgba(0,0,0,0.15))' }} />
            <div className="absolute inset-y-0 right-0 w-[13%]" style={{ background: 'linear-gradient(-90deg, rgba(0,0,0,0.35), rgba(0,0,0,0.15))' }} />

            {/* Lane boards (subtle lines) */}
            {[0.25, 0.35, 0.45, 0.55, 0.65, 0.75].map((x, i) => (
              <div key={i} className="absolute inset-y-0" style={{ left: `${x * 100}%`, width: '1px', background: 'rgba(0,0,0,0.04)' }} />
            ))}

            {/* Lane arrows */}
            {[0.33, 0.41, 0.5, 0.59, 0.67].map((x, i) => (
              <div key={`a${i}`} className="absolute" style={{
                left: `${x * 100}%`, top: '68%',
                width: 0, height: 0,
                borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                borderBottom: `9px solid rgba(255,255,255,${i === 2 ? '0.08' : '0.04'})`,
                transform: 'translateX(-50%)',
              }} />
            ))}

            {/* Foul line */}
            <div className="absolute" style={{ left: '13%', right: '13%', top: '80%', height: '2px', background: 'rgba(239,68,68,0.2)' }} />

            {/* Pins */}
            {pins.map(pin => (
              <motion.div key={pin.id} className="absolute z-20"
                style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%`, transform: 'translate(-50%, -50%)' }}
                animate={pin.standing
                  ? { scale: 1, opacity: 1, rotate: 0, x: 0, y: 0 }
                  : { scale: 0.5, opacity: 0.2, rotate: pin.fallAngle, x: pin.fallAngle > 0 ? 12 : -12, y: 8 }
                }
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <svg width="16" height="26" viewBox="0 0 16 26" fill="none">
                  <ellipse cx="8" cy="23" rx="5.5" ry="3" fill="white" />
                  <rect x="4" y="12" width="8" height="12" rx="3" fill="white" />
                  <circle cx="8" cy="6" r="4.5" fill="white" />
                  <ellipse cx="8" cy="15" rx="3.5" ry="1.5" fill="#ef4444" opacity="0.45" />
                  <ellipse cx="8" cy="18" rx="4" ry="1.2" fill="#ef4444" opacity="0.25" />
                  <ellipse cx="6.5" cy="5" rx="1" ry="1.5" fill="white" opacity="0.6" />
                  {/* Pin shadow */}
                  <ellipse cx="8" cy="25" rx="4" ry="1" fill="rgba(0,0,0,0.1)" />
                </svg>
              </motion.div>
            ))}

            {/* Ball (rolling or aiming) */}
            {ballPos ? (
              <motion.div className="absolute z-30" style={{
                left: `${ballPos.x * 100}%`, top: `${ballPos.y * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <defs>
                      <radialGradient id="ballG" cx="35%" cy="35%">
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="60%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#4c1d95" />
                      </radialGradient>
                    </defs>
                    <circle cx="11" cy="11" r="10" fill="url(#ballG)" />
                    <circle cx="8" cy="8" r="1.2" fill="#4c1d95" opacity="0.6" />
                    <circle cx="12" cy="7" r="1.2" fill="#4c1d95" opacity="0.6" />
                    <circle cx="9" cy="11" r="1.2" fill="#4c1d95" opacity="0.6" />
                    <ellipse cx="7" cy="8" rx="3" ry="3.5" fill="white" opacity="0.1" />
                  </svg>
                </motion.div>
                {/* Ball shadow */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-black/15" />
              </motion.div>
            ) : !throwing && (
              <motion.div className="absolute z-25" animate={{ x: '-50%', y: '-50%' }}
                style={{ left: `${aimX * 100}%`, top: '88%', transform: 'translate(-50%, -50%)' }}>
                <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
                  <defs>
                    <radialGradient id="ballG2" cx="35%" cy="35%">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="60%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#4c1d95" />
                    </radialGradient>
                  </defs>
                  <circle cx="11" cy="11" r="10" fill="url(#ballG2)" />
                  <circle cx="8" cy="8" r="1.2" fill="#4c1d95" opacity="0.6" />
                  <circle cx="12" cy="7" r="1.2" fill="#4c1d95" opacity="0.6" />
                  <circle cx="9" cy="11" r="1.2" fill="#4c1d95" opacity="0.6" />
                  <ellipse cx="7" cy="8" rx="3" ry="3.5" fill="white" opacity="0.1" />
                </svg>
                {/* Aim guide line */}
                <svg className="absolute -top-[250px] left-1/2 -translate-x-1/2" width="4" height="250" viewBox="0 0 4 250" fill="none">
                  <line x1="2" y1="250" x2={2 + (0.5 - aimX) * 5} y2="0"
                    stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 6" />
                </svg>
              </motion.div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 mt-2">
            <p className="text-slate-500 text-[10px] flex-1">Klik op de baan om te richten</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
              onClick={throwBall} disabled={throwing}
              className="px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-40"
              style={{
                background: throwing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #f97316, #ef4444)',
                boxShadow: throwing ? 'none' : '0 4px 15px rgba(249,115,22,0.3)',
              }}>
              Gooi! 🎳
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAMES + MAIN WIDGET
// ═══════════════════════════════════════════════════════════════
const GAMES: { id: GameId; name: string; color: string; desc: string; icon: (s: number) => React.ReactNode; gradient: string }[] = [
  {
    id: 'blackjack', name: 'Blackjack', color: '#10b981', desc: 'Kom zo dicht bij 21!',
    icon: (s: number) => <CardIcon size={s} />,
    gradient: 'linear-gradient(135deg, rgba(6,78,59,0.15), rgba(16,185,129,0.08))',
  },
  {
    id: 'darts', name: 'Darts', color: '#ef4444', desc: 'Gooi raak!',
    icon: (s: number) => <Dartboard size={s} />,
    gradient: 'linear-gradient(135deg, rgba(127,29,29,0.12), rgba(239,68,68,0.06))',
  },
  {
    id: 'bowling', name: 'Bowling', color: '#f97316', desc: 'Sla ze allemaal om!',
    icon: (s: number) => <BowlingIcon size={s} />,
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(249,115,22,0.08))',
  },
];

export default function MiniGames() {
  const [open, setOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState<GameId>('menu');
  const [scores, setScores] = useState<HighScores>({ blackjack: 0, darts: 0, bowling: 0 });
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

  const totalPts = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* Proactive bubble */}
      <AnimatePresence>
        {showBubble && !open && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
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
              <button onClick={(e) => { e.stopPropagation(); setShowBubble(false); }}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] hover:bg-slate-300 transition-colors">
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
          background: open ? 'linear-gradient(135deg, #ef4444, #f59e0b)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          boxShadow: open ? '0 8px 30px rgba(239,68,68,0.3)' : '0 8px 30px rgba(139,92,246,0.3)',
        }}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
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
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 flex items-center gap-3">
              <motion.div animate={{ rotate: currentGame !== 'menu' ? [0, -5, 5, 0] : 0 }}
                transition={{ duration: 1, repeat: currentGame !== 'menu' ? Infinity : 0, repeatDelay: 2 }}>
                <GameBear size={32} mood={currentGame === 'menu' ? 'happy' : 'playing'} />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-tight">
                  {currentGame === 'menu' ? 'Mini Games' : GAMES.find(g => g.id === currentGame)?.name}
                </p>
                <p className="text-slate-500 text-[10px]">
                  {currentGame === 'menu' ? `${totalPts} punten verzameld` : 'Veel plezier!'}
                </p>
              </div>
              {currentGame !== 'menu' && (
                <button onClick={goToMenu}
                  className="text-slate-500 hover:text-white transition-colors text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-white/10">
                  Menu
                </button>
              )}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

            {/* Content */}
            <div className="h-[420px] overflow-hidden">
              <AnimatePresence mode="wait">
                {currentGame === 'menu' && (
                  <motion.div key="menu" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="p-3 h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                    <div className="flex flex-col gap-3">
                      {GAMES.map((game, i) => (
                        <motion.button key={game.id}
                          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                          onClick={() => setCurrentGame(game.id)}
                          className="relative flex items-center gap-4 p-4 rounded-2xl group overflow-hidden text-left transition-all active:scale-[0.98]"
                          style={{ background: game.gradient }}
                        >
                          {/* Hover glow */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{ background: `radial-gradient(circle at 20% 50%, ${game.color}15, transparent 70%)` }} />
                          {/* Hover border */}
                          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{ boxShadow: `inset 0 0 0 1px ${game.color}20` }} />

                          {/* Icon */}
                          <motion.div whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }} transition={{ duration: 0.3 }}
                            className="relative z-10 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `${game.color}12` }}>
                            {game.icon(36)}
                          </motion.div>

                          {/* Info */}
                          <div className="relative z-10 flex-1 min-w-0">
                            <p className="text-white font-bold text-[15px]">{game.name}</p>
                            <p className="text-slate-400 text-xs">{game.desc}</p>
                            {scores[game.id as keyof HighScores] > 0 && (
                              <p className="text-[11px] font-bold mt-0.5" style={{ color: game.color }}>
                                Record: {scores[game.id as keyof HighScores]} pts
                              </p>
                            )}
                          </div>

                          {/* Arrow */}
                          <div className="relative z-10 text-slate-600 group-hover:text-white/60 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 text-center">
                      <p className="text-slate-600 text-[10px]">3 games beschikbaar</p>
                    </div>
                  </motion.div>
                )}

                {currentGame === 'blackjack' && (
                  <motion.div key="bj" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                    <BlackjackGame onBack={goToMenu} onScore={handleScore('blackjack')} />
                  </motion.div>
                )}
                {currentGame === 'darts' && (
                  <motion.div key="darts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                    <DartsGame onBack={goToMenu} onScore={handleScore('darts')} />
                  </motion.div>
                )}
                {currentGame === 'bowling' && (
                  <motion.div key="bowling" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                    <BowlingGame onBack={goToMenu} onScore={handleScore('bowling')} />
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
