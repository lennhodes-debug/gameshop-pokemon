'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('system');
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    let finalTheme: 'light' | 'dark' = newTheme as 'light' | 'dark';

    if (newTheme === 'system') {
      finalTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    if (finalTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1]">
      <button
        onClick={() => handleThemeChange('light')}
        title="Light mode"
        aria-label="Light mode"
        className={`p-1.5 rounded-lg transition-all ${
          theme === 'light' ? 'bg-white/80 dark:bg-white/10 text-yellow-500 dark:text-yellow-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <motion.svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12a9 9 0 11-18 0 9 9 0 0118 0m0 0v-2.25m-6.364.386l1.591-1.591"
          />
        </motion.svg>
      </button>

      <button
        onClick={() => handleThemeChange('dark')}
        title="Dark mode"
        aria-label="Dark mode"
        className={`p-1.5 rounded-lg transition-all ${
          theme === 'dark' ? 'bg-slate-800 dark:bg-white/10 text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <motion.svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </motion.svg>
      </button>

      <button
        onClick={() => handleThemeChange('system')}
        title="System preference"
        aria-label="System preference"
        className={`p-1.5 rounded-lg transition-all ${
          theme === 'system' ? 'bg-slate-200 dark:bg-white/10 text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <motion.svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a6 6 0 11-12 0V5.25m0 0A2.25 2.25 0 0015 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0121 21h-6a2.25 2.25 0 01-2.25-2.25V5.25z"
          />
        </motion.svg>
      </button>
    </div>
  );
}
