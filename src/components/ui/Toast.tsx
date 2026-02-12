'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
  icon?: ReactNode;
  image?: string;
}

interface ToastContextType {
  addToast: (message: string, type?: Toast['type'], icon?: ReactNode, image?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Cleanup alle timers bij unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success', icon?: ReactNode, image?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type, icon, image }]);
    const timer = setTimeout(() => {
      removeToast(id);
    }, 3000);
    timersRef.current.set(id, timer);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[100] flex flex-col gap-2 items-end"
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              role="status"
              initial={{ opacity: 0, y: 20, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
              className={`relative flex items-center gap-3 pl-5 pr-10 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border text-sm font-semibold overflow-hidden ${
                toast.type === 'success'
                  ? 'bg-emerald-500/95 border-emerald-400/30 text-white shadow-emerald-500/20'
                  : toast.type === 'error'
                  ? 'bg-red-500/95 border-red-400/30 text-white shadow-red-500/20'
                  : 'bg-slate-900/95 border-slate-700/30 text-white shadow-slate-900/20'
              }`}
            >
              {toast.image && (
                <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/10 ring-1 ring-white/10">
                  <img src={toast.image} alt="" aria-hidden="true" className="h-full w-full object-cover" />
                </div>
              )}
              {!toast.image && (toast.icon || (
                toast.type === 'success' ? (
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : toast.type === 'error' ? (
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                )
              ))}
              {toast.message}
              {/* Dismiss knop */}
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Melding sluiten"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/40 origin-left"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 3, ease: 'linear' }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
