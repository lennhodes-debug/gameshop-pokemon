import Link from 'next/link';
import Logo from './Logo';

const footerLinks = {
  shop: [
    { href: '/shop', label: 'Alle producten' },
    { href: '/shop?platform=Nintendo+Switch', label: 'Nintendo Switch' },
    { href: '/shop?platform=GameCube', label: 'GameCube' },
    { href: '/shop?platform=Nintendo+64', label: 'Nintendo 64' },
    { href: '/shop?platform=Super+Nintendo', label: 'Super Nintendo' },
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

export default function Footer() {
  return (
    <footer className="bg-navy-900 relative">
      {/* Gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <Logo className="h-9 w-9" />
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg leading-tight">Gameshop</span>
                <span className="text-emerald-400 text-xs font-medium -mt-0.5">Enter</span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              De Nintendo specialist van Nederland. Alle producten zijn origineel en persoonlijk getest op werking.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>KvK: 93642474</span>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Shop</h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Informatie</h3>
            <ul className="space-y-2.5">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Contact</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="mailto:gameshopenter@gmail.com" className="hover:text-emerald-400 transition-colors">
                  gameshopenter@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:0641126067" className="hover:text-emerald-400 transition-colors">
                  06-41126067
                </a>
              </li>
              <li>
                <a href="https://wa.me/31641126067" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  WhatsApp
                </a>
              </li>
              <li className="pt-2">
                <span className="text-slate-500">Uitsluitend online webshop</span>
              </li>
            </ul>

            {/* Juridisch */}
            <h3 className="text-white font-semibold text-sm mt-6 mb-4">Juridisch</h3>
            <ul className="space-y-2.5">
              {footerLinks.juridisch.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              {new Date().getFullYear()} Gameshop Enter. Alle rechten voorbehouden.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>iDEAL</span>
              <span className="text-slate-700">|</span>
              <span>Creditcard</span>
              <span className="text-slate-700">|</span>
              <span>PayPal</span>
              <span className="text-slate-700">|</span>
              <span>Apple Pay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
