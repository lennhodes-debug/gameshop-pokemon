'use client';

import { motion } from 'framer-motion';

const trustItems = [
  {
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: '100% Origineel',
    subtitle: 'Persoonlijk getest',
  },
  {
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    title: 'Zorgvuldig verpakt',
    subtitle: 'Bubbeltjesfolie & PostNL',
  },
  {
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    title: 'Gratis verzending',
    subtitle: 'Vanaf \u20ac100',
  },
  {
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
      </svg>
    ),
    title: '14 dagen retour',
    subtitle: 'Zonder gedoe',
  },
];

export default function TrustStrip() {
  return (
    <section className="bg-[#f8fafc] -mt-1">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Desktop: inline met dividers */}
          <div className="hidden lg:flex items-center justify-between">
            {trustItems.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && (
                  <div className="h-8 w-px bg-slate-200/80 mx-8" />
                )}
                <div className="flex items-center gap-3">
                  <div className="text-emerald-600/70">{item.icon}</div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800 leading-tight">{item.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: 2x2 grid, compact */}
          <div className="grid grid-cols-2 gap-4 lg:hidden">
            {trustItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2.5">
                <div className="text-emerald-600/70 shrink-0">{item.icon}</div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{item.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Subtiele scheidingslijn */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>
    </section>
  );
}
