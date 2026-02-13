'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from './Logo';

const footerLinks = {
  shop: [
    { href: '/shop', label: 'Alle Nintendo games' },
    { href: '/shop?platform=Nintendo+DS', label: 'Nintendo DS' },
    { href: '/shop?platform=Game+Boy+Advance', label: 'Game Boy Advance' },
    { href: '/shop?platform=Nintendo+3DS', label: 'Nintendo 3DS' },
    { href: '/shop?platform=Game+Boy+%2F+Color', label: 'Game Boy / Color' },
    { href: '/inkoop', label: 'Games verkopen' },
  ],
  info: [
    { href: '/over-ons', label: 'Over ons' },
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
    <footer className="relative bg-navy-900" role="contentinfo">
      <div className="h-px bg-white/[0.06]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
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
              Dé Nintendo specialist van Nederland. Alle games zijn origineel en persoonlijk getest op werking.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>KvK: 93642474</span>
            </div>
          </motion.div>

          {/* Shop links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-emerald-400 text-sm transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Info links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide">Informatie</h3>
            <ul className="space-y-3">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-emerald-400 text-sm transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-white font-semibold text-sm mt-8 mb-4 tracking-wide">Juridisch</h3>
            <ul className="space-y-3">
              {footerLinks.juridisch.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-emerald-400 text-sm transition-colors duration-200">
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
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4"
          >
            <a href="https://www.marktplaats.nl/u/gameshop-enter/100074714/" target="_blank" rel="noopener noreferrer" className="block mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/20 transition-colors group">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-emerald-400 text-xl font-extrabold">5.0</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-slate-300 text-sm font-semibold">1.360+ reviews op Marktplaats</p>
              <p className="text-slate-500 text-xs mt-0.5 group-hover:text-slate-400 transition-colors">Bekijk onze reviews →</p>
            </a>

            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide">Contact</h3>
            <a href="mailto:gameshopenter@gmail.com" className="flex items-center gap-3 text-slate-400 hover:text-emerald-400 text-sm transition-colors group">
              <span className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </span>
              gameshopenter@gmail.com
            </a>

            <div className="mt-8">
              <h3 className="text-white font-semibold text-sm mb-3 tracking-wide">Betaalmethoden</h3>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <span key={method} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.06] text-xs text-slate-400 font-medium cursor-default">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} Gameshop Enter. Alle rechten voorbehouden.
            </p>
            <p className="text-slate-500 text-xs">
              Uitsluitend online webshop — verzending via PostNL
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
