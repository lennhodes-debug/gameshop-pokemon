'use client';

import { useState, useEffect } from 'react';

function HealthBarLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 2));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const hearts = Math.floor(progress / 20);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`text-sm transition-all duration-150 ${
              i < hearts ? 'text-red-500 scale-110' : 'text-slate-300 scale-90'
            }`}
            style={{ fontFamily: 'monospace' }}
          >
            {i < hearts ? '\u2665' : '\u2661'}
          </span>
        ))}
      </div>
      <div className="w-32 h-3 bg-slate-200 rounded-sm overflow-hidden border border-slate-300">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-slate-400 tracking-wider">LADEN...</span>
    </div>
  );
}

function PacManLoader() {
  const [pos, setPos] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPos((p) => (p >= 100 ? 0 : p + 2));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const dotCount = 8;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-6 overflow-hidden">
        {/* Dots */}
        {Array.from({ length: dotCount }, (_, i) => {
          const dotPos = ((i + 1) / (dotCount + 1)) * 100;
          const eaten = pos > dotPos;
          return (
            <div
              key={i}
              className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-opacity duration-100 ${
                eaten ? 'opacity-0' : 'bg-amber-400 opacity-100'
              }`}
              style={{ left: `${dotPos}%` }}
            />
          );
        })}
        {/* Pac-Man */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5"
          style={{ left: `${pos}%` }}
        >
          <div
            className="w-full h-full rounded-full bg-yellow-400"
            style={{
              clipPath: `polygon(50% 50%, 100% 15%, 100% 0%, 0% 0%, 0% 100%, 100% 100%, 100% 85%)`,
              animation: 'pacman-chomp 0.3s infinite alternate',
            }}
          />
        </div>
      </div>
      <span className="text-[10px] font-mono text-slate-400 tracking-wider">LADEN...</span>
    </div>
  );
}

function QuestionBlockLoader() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div
          className="w-10 h-10 bg-gradient-to-b from-amber-400 to-amber-500 rounded-sm border-2 border-amber-600 flex items-center justify-center animate-bounce"
          style={{ animationDuration: '0.6s' }}
        >
          <span className="text-amber-800 font-black text-lg" style={{ fontFamily: 'monospace' }}>?</span>
        </div>
        {/* Coin particles */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500 animate-ping opacity-60" />
      </div>
      <span className="text-[10px] font-mono text-slate-400 tracking-wider">LADEN...</span>
    </div>
  );
}

const loaders = [HealthBarLoader, PacManLoader, QuestionBlockLoader];

export default function RetroLoader() {
  const [LoaderComponent] = useState(() => loaders[Math.floor(Math.random() * loaders.length)]);

  return (
    <div className="flex items-center justify-center py-8">
      <LoaderComponent />
    </div>
  );
}
