'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 text-sm mb-6"
      aria-label="Breadcrumb navigatie"
    >
      {items.map((item, index) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="flex items-center gap-2"
        >
          {index > 0 && (
            <span className="text-slate-300 dark:text-slate-600">/</span>
          )}

          {item.isActive ? (
            <span className="text-slate-900 dark:text-white font-semibold">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </motion.div>
      ))}
    </motion.nav>
  );
}
