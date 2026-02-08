'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
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
        const content = (
          <div className="py-4">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between text-left group/faq"
            >
              <span className="text-base font-semibold text-slate-900 dark:text-white pr-4 group-hover/faq:text-emerald-600 dark:group-hover/faq:text-emerald-400 transition-colors duration-200">
                {item.question}
              </span>
              <svg
                className={cn(
                  'h-5 w-5 flex-shrink-0 text-slate-500 dark:text-slate-400 transition-transform duration-300',
                  openIndex === index && 'rotate-180 text-emerald-500'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={cn(
                'overflow-hidden transition-all duration-300',
                openIndex === index ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
              )}
            >
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.answer}</p>
            </div>
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
