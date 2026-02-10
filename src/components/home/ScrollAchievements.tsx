'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-scroll', title: 'Eerste Scroll', desc: 'Je bent begonnen met ontdekken', icon: '🕹️' },
  { id: 'explorer', title: 'Ontdekker', desc: '25% van de pagina verkend', icon: '🗺️' },
  { id: 'time-traveler', title: 'Tijdreiziger', desc: 'Halverwege het Nintendo-universum', icon: '⏳' },
  { id: 'veteran', title: 'Veteraan', desc: 'De hele reis voltooid', icon: '🏆' },
  { id: 'speed-runner', title: 'Speed Runner', desc: 'Supersnel gescrolld', icon: '⚡' },
];

const STORAGE_KEY = 'gameshop-achievements';

function getUnlocked(): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveUnlocked(ids: Set<string>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch { /* silent */ }
}

export default function ScrollAchievements() {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [popup, setPopup] = useState<Achievement | null>(null);
  const [showBadge, setShowBadge] = useState(false);
  const queueRef = useRef<Achievement[]>([]);
  const showingRef = useRef(false);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(0);

  // Initialiseer vanuit sessionStorage
  useEffect(() => {
    const saved = getUnlocked();
    setUnlocked(saved);
    if (saved.size > 0) setShowBadge(true);
  }, []);

  const unlock = useCallback((achievement: Achievement) => {
    setUnlocked(prev => {
      if (prev.has(achievement.id)) return prev;
      const next = new Set(prev);
      next.add(achievement.id);
      saveUnlocked(next);
      setShowBadge(true);

      // Queue popup
      queueRef.current.push(achievement);
      if (!showingRef.current) showNext();

      return next;
    });
  }, []);

  const showNext = useCallback(() => {
    const next = queueRef.current.shift();
    if (!next) {
      showingRef.current = false;
      return;
    }
    showingRef.current = true;
    setPopup(next);
    setTimeout(() => {
      setPopup(null);
      setTimeout(showNext, 300);
    }, 3000);
  }, []);

  // Scroll tracking
  useEffect(() => {
    const check = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollY / docHeight : 0;
      const now = performance.now();

      // Speed check
      const dt = now - lastScrollTime.current;
      if (dt > 0 && dt < 1000) {
        const speed = Math.abs(scrollY - lastScrollY.current) / (dt / 1000);
        if (speed > 3000) {
          const a = ACHIEVEMENTS.find(a => a.id === 'speed-runner')!;
          unlock(a);
        }
      }
      lastScrollY.current = scrollY;
      lastScrollTime.current = now;

      // Scroll milestones
      if (scrollY > 100) unlock(ACHIEVEMENTS[0]);
      if (progress > 0.25) unlock(ACHIEVEMENTS[1]);
      if (progress > 0.50) unlock(ACHIEVEMENTS[2]);
      if (progress > 0.85) unlock(ACHIEVEMENTS[3]);
    };

    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, [unlock]);

  return (
    <>
      {/* Achievement popup */}
      <AnimatePresence>
        {popup && (
          <motion.div
            key={popup.id}
            initial={{ x: 100, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 100, opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-24 right-4 z-[9000] pointer-events-none"
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0a0e1a]/95 backdrop-blur-xl border border-emerald-500/20 shadow-xl shadow-emerald-500/10 min-w-[260px]">
              {/* Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

              {/* Icon */}
              <div className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-lg border border-emerald-500/20">
                {popup.icon}
              </div>

              {/* Text */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Achievement</span>
                  <motion.div
                    className="h-px flex-1 bg-gradient-to-r from-emerald-500/40 to-transparent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    style={{ transformOrigin: 'left' }}
                  />
                </div>
                <p className="text-white font-bold text-sm mt-0.5">{popup.title}</p>
                <p className="text-white/40 text-[10px] mt-0.5">{popup.desc}</p>
              </div>

              {/* Shine sweep */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ delay: 0.2, duration: 0.8 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge counter — rechtsboven */}
      <AnimatePresence>
        {showBadge && unlocked.size > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="fixed top-24 right-4 z-[8999]"
          >
            <div className="group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#0a0e1a]/80 backdrop-blur-sm border border-white/[0.06] cursor-default">
              <span className="text-xs">🏆</span>
              <span className="text-[10px] font-bold text-emerald-400 tabular-nums">
                {unlocked.size}/{ACHIEVEMENTS.length}
              </span>

              {/* Tooltip on hover */}
              <div className="absolute top-full right-0 mt-2 w-56 p-3 rounded-xl bg-[#0a0e1a]/95 backdrop-blur-xl border border-white/[0.08] shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
                <p className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold mb-2">Achievements</p>
                <div className="space-y-1.5">
                  {ACHIEVEMENTS.map(a => (
                    <div key={a.id} className={`flex items-center gap-2 ${unlocked.has(a.id) ? '' : 'opacity-30'}`}>
                      <span className="text-xs">{a.icon}</span>
                      <span className="text-[10px] text-white/80 font-medium">{a.title}</span>
                      {unlocked.has(a.id) && <span className="ml-auto text-emerald-400 text-[8px]">✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
