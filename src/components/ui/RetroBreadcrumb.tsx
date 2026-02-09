'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ROUTE_LABELS: Record<string, string> = {
  '': 'Home',
  shop: 'Shop',
  inkoop: 'Inkoop',
  'over-ons': 'Over ons',
  faq: 'FAQ',
  contact: 'Contact',
  winkelwagen: 'Winkelwagen',
  afrekenen: 'Afrekenen',
  privacybeleid: 'Privacybeleid',
  retourbeleid: 'Retourbeleid',
  'algemene-voorwaarden': 'Algemene voorwaarden',
};

interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function RetroBreadcrumb() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

  segments.forEach((segment, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const label = ROUTE_LABELS[segment] || decodeURIComponent(segment).toUpperCase();
    items.push({ label, href });
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: `https://gameshopenter.nl${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-xs font-mono text-slate-400 mb-4">
        <ol className="flex flex-wrap items-center gap-0.5">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={item.href} className="flex items-center">
                {i > 0 && (
                  <span className="mx-1.5 text-emerald-500/60 select-none">{'\u00BB'}</span>
                )}
                {isLast ? (
                  <span className="text-slate-600 font-semibold">
                    {item.label}
                    <span className="inline-block w-[6px] h-3.5 bg-emerald-500 ml-0.5 animate-pulse align-middle" />
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-emerald-500 transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
