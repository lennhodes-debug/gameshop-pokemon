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
          <div className="py-4">
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between text-left group/faq"
            >
              <span className="text-base font-semibold text-slate-900 dark:text-white pr-4 group-hover/faq:text-emerald-600 dark:group-hover/faq:text-emerald-400 transition-colors duration-200">
                {item.question}
              </span>
              <motion.svg
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isOpen ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
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
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-3">{item.answer}</p>
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
