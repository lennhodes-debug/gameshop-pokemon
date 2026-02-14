'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from './Logo';

const shopLinks = [
  { href: '/shop', label: 'Alle games' },
  { href: '/nintendo', label: 'Platforms' },
  { href: '/game-finder', label: 'Game Finder' },
  { href: '/inkoop', label: 'Games verkopen' },
  { href: '/verlanglijst', label: 'Verlanglijst' },
];

const infoLinks = [
  { href: '/over-ons', label: 'Over ons' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

const legalLinks = [
  { href: '/algemene-voorwaarden', label: 'Algemene voorwaarden' },
  { href: '/privacybeleid', label: 'Privacybeleid' },
  { href: '/retourbeleid', label: 'Retourbeleid' },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#050810] overflow-hidden" role="contentinfo">
      {/* Top gradient accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.03),transparent_70%)] pointer-events-none" />

      {/* Giant watermark logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.015]">
        <Logo className="h-[480px] w-[480px]" id="footerWm" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-16 lg:pt-20 pb-12">
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="col-span-2 lg:col-span-4"
            >
              <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                <Logo className="h-9 w-9 transition-transform duration-500 group-hover:rotate-[8deg]" id="footerNav" />
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-lg tracking-[-0.02em] leading-none">Gameshop Enter</span>
                  <span className="text-emerald-400/50 text-[10px] font-medium tracking-[0.2em] uppercase mt-0.5">Nintendo specialist</span>
                </div>
              </Link>

              <p className="text-slate-500 text-[13px] leading-relaxed max-w-[280px] mb-6">
                D&eacute; Nintendo specialist van Nederland. Alle games zijn origineel en persoonlijk getest op werking.
              </p>

              {/* Review card */}
              <a
                href="https://www.marktplaats.nl/u/gameshop-enter/100074714/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/20 hover:bg-white/[0.05] transition-all duration-300 group"
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-white/60 text-xs font-medium">5.0 &middot; 1.360+ reviews</span>
                <svg className="h-3 w-3 text-slate-600 group-hover:text-emerald-400/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>
            </motion.div>

            {/* Shop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <h3 className="text-[11px] font-medium text-white/25 uppercase tracking-[0.15em] mb-5">Shop</h3>
              <ul className="space-y-3">
                {shopLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="relative text-slate-500 hover:text-white text-[13px] transition-colors duration-200 group/link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Info + Juridisch */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <h3 className="text-[11px] font-medium text-white/25 uppercase tracking-[0.15em] mb-5">Info</h3>
              <ul className="space-y-3">
                {infoLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-slate-500 hover:text-white text-[13px] transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <h3 className="text-[11px] font-medium text-white/25 uppercase tracking-[0.15em] mt-8 mb-5">Juridisch</h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-slate-500 hover:text-white text-[13px] transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="col-span-2 lg:col-span-4"
            >
              <h3 className="text-[11px] font-medium text-white/25 uppercase tracking-[0.15em] mb-5">Contact</h3>

              <a href="mailto:gameshopenter@gmail.com" className="flex items-center gap-3 text-slate-500 hover:text-white text-[13px] transition-colors duration-200 mb-8 group">
                <span className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center group-hover:border-emerald-500/20 group-hover:bg-white/[0.05] transition-all duration-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </span>
                gameshopenter@gmail.com
              </a>

              <div className="space-y-3.5 text-[13px]">
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center shrink-0">
                    <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                  </span>
                  <span>Verzending via PostNL</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center shrink-0">
                    <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                  </span>
                  <span>Betaling via iDEAL</span>
                </div>
              </div>

              {/* Social */}
              <div className="flex items-center gap-3 mt-8">
                <a
                  href="https://www.instagram.com/gameshopenter/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white hover:border-pink-500/30 hover:bg-pink-500/[0.06] transition-all duration-300"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a
                  href="https://www.marktplaats.nl/u/gameshop-enter/100074714/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Marktplaats"
                  className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white hover:border-orange-500/30 hover:bg-orange-500/[0.06] transition-all duration-300"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                  </svg>
                </a>
              </div>

              <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/40" />
                KvK: 93642474
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.04] py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-700 text-xs">
              &copy; {new Date().getFullYear()} Gameshop Enter
            </p>
            <p className="text-slate-800 text-[11px]">
              Uitsluitend online webshop
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
