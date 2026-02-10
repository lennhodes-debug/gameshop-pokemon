'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from './Logo';

const footerLinks = {
  shop: [
    { href: '/shop', label: 'Alle producten' },
    { href: '/shop?platform=Nintendo+Switch', label: 'Nintendo Switch' },
    { href: '/shop?platform=GameCube', label: 'GameCube' },
    { href: '/shop?platform=Nintendo+64', label: 'Nintendo 64' },
    { href: '/shop?platform=Super+Nintendo', label: 'Super Nintendo' },
    { href: '/inkoop', label: 'Games verkopen' },
  ],
  info: [
    { href: '/over-ons', label: 'Over ons' },
    { href: '/nintendo', label: 'Het verhaal van Nintendo' },
    { href: '/faq', label: 'Veelgestelde vragen' },
    { href: '/contact', label: 'Contact' },
  ],
  juridisch: [
    { href: '/algemene-voorwaarden', label: 'Algemene voorwaarden' },
    { href: '/privacybeleid', label: 'Privacybeleid' },
    { href: '/retourbeleid', label: 'Retourbeleid' },
  ],
};

const paymentMethods = ['iDEAL', 'Creditcard', 'PayPal', 'Bancontact', 'Apple Pay'];

export default function Footer() {
  return (
    <footer className="relative bg-navy-900 overflow-hidden" role="contentinfo">
      {/* Aurora background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500/5 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      {/* Animated gradient line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent animate-gradient-x" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
            className="lg:col-span-4"
          >
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <Logo className="h-10 w-10" />
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl leading-tight tracking-tight">Gameshop</span>
                <span className="text-emerald-400 text-[11px] font-semibold tracking-widest uppercase -mt-0.5">Enter</span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-5 max-w-xs">
              De Nintendo specialist van Nederland. Alle producten zijn origineel en persoonlijk getest op werking.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>KvK: 93642474</span>
            </div>
          </motion.div>

          {/* Shop links */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            className="lg:col-span-2"
          >
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-emerald-400 hover:translate-x-1 text-sm transition-all duration-200 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Info links */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="lg:col-span-2"
          >
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide">Informatie</h3>
            <ul className="space-y-3">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-emerald-400 hover:translate-x-1 text-sm transition-all duration-200 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-white font-semibold text-sm mt-8 mb-4 tracking-wide">Juridisch</h3>
            <ul className="space-y-3">
              {footerLinks.juridisch.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-emerald-400 hover:translate-x-1 text-sm transition-all duration-200 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
            className="lg:col-span-4"
          >
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide">Contact</h3>
            <div className="space-y-3">
              <a href="mailto:gameshopenter@gmail.com" className="flex items-center gap-3 text-slate-400 hover:text-emerald-400 text-sm transition-colors group">
                <span className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </span>
                gameshopenter@gmail.com
              </a>
              <a href="https://www.marktplaats.nl/u/gameshop-enter/100074714/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-emerald-400 text-sm transition-colors group">
                <span className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </span>
                1.360+ reviews op Marktplaats
              </a>
            </div>

            {/* Payment methods */}
            <div className="mt-8">
              <h3 className="text-white font-semibold text-sm mb-3 tracking-wide">Betaalmethoden</h3>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <span key={method} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.06] text-xs text-slate-400 font-medium hover:bg-white/10 hover:text-slate-300 hover:border-white/[0.12] transition-all duration-200 cursor-default">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 pt-8 border-t border-white/[0.06]"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} Gameshop Enter. Alle rechten voorbehouden.
            </p>
            <p className="text-slate-500 text-xs">
              Uitsluitend online webshop — verzending via PostNL
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
