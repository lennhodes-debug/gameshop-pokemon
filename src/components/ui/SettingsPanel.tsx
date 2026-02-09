'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRetroSound } from '@/hooks/useRetroSound';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const { isMuted, setMuted, play } = useRetroSound();
  const { theme, toggleTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [retroMode, setRetroMode] = useState(false);

  useEffect(() => {
    setSoundEnabled(!isMuted());
    try {
      setAnimationsEnabled(localStorage.getItem('gameshop-animations') !== 'false');
      setRetroMode(localStorage.getItem('gameshop-retro-mode') === 'true');
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

  const toggleRetro = () => {
    const newVal = !retroMode;
    setRetroMode(newVal);
    try {
      localStorage.setItem('gameshop-retro-mode', String(newVal));
    } catch {
      // ignore
    }
    if (newVal) {
      document.documentElement.classList.add('retro-mode');
      play('powerUp');
    } else {
      document.documentElement.classList.remove('retro-mode');
    }
  };

  const isDark = theme === 'dark';

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-4 z-50 h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
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
              className="fixed inset-0 z-[60] bg-black/30 dark:bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-[70] w-80 bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Instellingen</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Dark mode toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Donkere modus</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Schakel tussen licht en donker</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      isDark ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                    role="switch"
                    aria-checked={isDark}
                    aria-label="Donkere modus"
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 flex items-center justify-center ${
                        isDark ? 'translate-x-5' : ''
                      }`}
                    >
                      {isDark ? (
                        <svg className="h-3 w-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                      ) : (
                        <svg className="h-3 w-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </button>
                </div>

                {/* Geluidseffecten */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Geluidseffecten</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Retro 8-bit geluiden</p>
                  </div>
                  <button
                    onClick={toggleSound}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      soundEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
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
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Animaties</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Pagina transities en effecten</p>
                  </div>
                  <button
                    onClick={toggleAnimations}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      animationsEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
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

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Nostalgie modus */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="text-base">🕹️</span> Nostalgie modus
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">CRT scanlines &amp; retro vibes</p>
                  </div>
                  <button
                    onClick={toggleRetro}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      retroMode ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                    role="switch"
                    aria-checked={retroMode}
                    aria-label="Nostalgie modus"
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        retroMode ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                <p className="text-[10px] text-slate-300 dark:text-slate-600 text-center">
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
