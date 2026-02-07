'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRetroSound } from '@/hooks/useRetroSound';

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const { isMuted, setMuted, play } = useRetroSound();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    setSoundEnabled(!isMuted());
    try {
      setAnimationsEnabled(localStorage.getItem('gameshop-animations') !== 'false');
    } catch {
      // ignore
    }
  }, [isMuted]);

  const toggleSound = () => {
    const newMuted = soundEnabled;
    setMuted(newMuted);
    setSoundEnabled(!newMuted);
    if (!newMuted) play('select');
  };

  const toggleAnimations = () => {
    const newVal = !animationsEnabled;
    setAnimationsEnabled(newVal);
    try {
      localStorage.setItem('gameshop-animations', String(newVal));
    } catch {
      // ignore
    }
    if (newVal) {
      document.documentElement.classList.remove('reduce-motion');
    } else {
      document.documentElement.classList.add('reduce-motion');
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-4 z-50 h-10 w-10 rounded-full bg-white/80 backdrop-blur border border-slate-200 shadow-lg flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-colors"
        aria-label="Instellingen"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Settings drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-[70] w-80 bg-white shadow-2xl p-6 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold text-slate-900">Instellingen</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Geluidseffecten */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Geluidseffecten</p>
                    <p className="text-xs text-slate-400">Retro 8-bit geluiden</p>
                  </div>
                  <button
                    onClick={toggleSound}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      soundEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={soundEnabled}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        soundEnabled ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Animaties */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Animaties</p>
                    <p className="text-xs text-slate-400">Pagina transities en effecten</p>
                  </div>
                  <button
                    onClick={toggleAnimations}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      animationsEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={animationsEnabled}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        animationsEnabled ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>

                <hr className="border-slate-100" />

                <p className="text-[10px] text-slate-300 text-center">
                  Gameshop Enter v2.0
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
