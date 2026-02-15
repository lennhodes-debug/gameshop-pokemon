'use client';

import { motion } from 'framer-motion';

type ViewType = 'grid' | 'list' | 'compact';

interface ViewToggleProps {
  currentView: ViewType;
  onChange: (view: ViewType) => void;
}

export default function ViewToggle({ currentView, onChange }: ViewToggleProps) {
  const views: Array<{ type: ViewType; label: string; icon: string }> = [
    { type: 'grid', label: 'Grid', icon: '⊞' },
    { type: 'list', label: 'Lijst', icon: '≡' },
    { type: 'compact', label: 'Compact', icon: '☰' },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
      {views.map(({ type, label, icon }) => (
        <motion.button
          key={type}
          onClick={() => onChange(type)}
          className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === type
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {currentView === type && (
            <motion.div
              layoutId="activeView"
              className="absolute inset-0 bg-white dark:bg-slate-700 rounded-md -z-10"
              transition={{ type: 'spring', bounce: 0.2 }}
            />
          )}
          <span className="inline-block mr-1">{icon}</span>
          <span className="hidden sm:inline">{label}</span>
        </motion.button>
      ))}
    </div>
  );
}
