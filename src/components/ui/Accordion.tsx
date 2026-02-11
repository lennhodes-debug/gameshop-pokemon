'use client';

import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  staggerVariant?: Variants;
}

export default function Accordion({ items, className, staggerVariant }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn('divide-y divide-slate-200 dark:divide-slate-700', className)}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const content = (
          <div className="py-4 group/item">
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between text-left group/faq"
            >
              <div className="flex items-center gap-3 pr-4">
                <motion.span
                  className={cn(
                    'flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300',
                    isOpen
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 group-hover/faq:bg-emerald-50 dark:group-hover/faq:bg-emerald-500/10 group-hover/faq:text-emerald-500'
                  )}
                  animate={{ scale: isOpen ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {index + 1}
                </motion.span>
                <span className="text-base font-semibold text-slate-900 dark:text-white group-hover/faq:text-emerald-600 dark:group-hover/faq:text-emerald-400 transition-colors duration-200">
                  {item.question}
                </span>
              </div>
              <motion.div
                className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300',
                  isOpen
                    ? 'bg-emerald-50 dark:bg-emerald-500/10'
                    : 'bg-transparent group-hover/faq:bg-slate-50 dark:group-hover/faq:bg-slate-700'
                )}
              >
                <motion.svg
                  className={cn(
                    'h-4 w-4 flex-shrink-0',
                    isOpen ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.2 } }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 pl-10">
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-400" />
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-4">{item.answer}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

        if (staggerVariant) {
          return (
            <motion.div key={index} variants={staggerVariant}>
              {content}
            </motion.div>
          );
        }

        return <div key={index}>{content}</div>;
      })}
    </div>
  );
}
