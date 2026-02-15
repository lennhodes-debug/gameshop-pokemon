'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PremiumFooter() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Shop',
      links: [
        { label: 'Alle Games', href: '/shop' },
        { label: 'Consoles', href: '/shop?category=consoles' },
        { label: 'Sales', href: '/shop?category=sales' },
        { label: 'Game Finder', href: '/game-finder' },
      ],
    },
    {
      title: 'Bedrijf',
      links: [
        { label: 'Over ons', href: '/over-ons' },
        { label: 'Contact', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Inkoop', href: '/inkoop' },
      ],
    },
    {
      title: 'Legaal',
      links: [
        { label: 'Privacybeleid', href: '/privacybeleid' },
        { label: 'Algemene Voorwaarden', href: '/algemene-voorwaarden' },
        { label: 'Retourbeleid', href: '/retourbeleid' },
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 dark:from-slate-900 dark:to-black border-t border-emerald-900/30 mt-16 lg:mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-black text-white">
                G
              </div>
              <div>
                <p className="text-sm font-black text-white">Gameshop</p>
                <p className="text-xs text-emerald-400">ENTER</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Originele Nintendo retro games met professionele foto's en snelle verzending.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: '🐦', label: 'Twitter' },
                { icon: '📘', label: 'Facebook' },
                { icon: '📷', label: 'Instagram' },
              ].map((social, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="h-10 w-10 rounded-lg bg-slate-800 hover:bg-emerald-500 transition-colors flex items-center justify-center text-lg"
                >
                  {social.icon}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Links Sections */}
          {footerSections.map((section, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <h3 className="font-bold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-emerald-400 transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mb-8 origin-left"
        />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="text-xs text-slate-500 text-center md:text-left">
            <p>
              © {currentYear} Gameshop Enter. Alle rechten voorbehouden. | Powered by{' '}
              <span className="text-emerald-400 font-semibold">Next.js</span> &{' '}
              <span className="text-emerald-400 font-semibold">Framer Motion</span>
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4">
            {[
              { icon: '🔒', text: 'Veilig' },
              { icon: '✅', text: 'Geverifieerd' },
              { icon: '🚀', text: 'Snel' },
            ].map((badge, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-emerald-500/20 hover:border-emerald-500/50 transition-all"
              >
                <span className="text-sm">{badge.icon}</span>
                <span className="text-xs text-slate-400 font-medium">{badge.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
