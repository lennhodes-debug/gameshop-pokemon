'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { getAllProducts, getProductsByPlatform } from '@/lib/products';

interface Platform {
  id: string;
  name: string;
  year: number;
  gameCount: number;
  description: string;
  color: string;
  tag: string;
  image?: string;
}

interface PlatformShowcaseProps {
  platforms?: Platform[];
}

// Platform configuration with metadata
const PLATFORM_CONFIG: Record<string, Omit<Platform, 'gameCount' | 'id'>> = {
  'Nintendo DS': {
    name: 'Nintendo DS',
    year: 2004,
    description: 'Dual Screen Revolution',
    color: 'from-blue-600 to-cyan-500',
    tag: 'DUAL SCREEN',
    image: '/images/consoles/ds.webp',
  },
  'Nintendo 3DS': {
    name: 'Nintendo 3DS',
    year: 2011,
    description: 'Stereoscopic 3D',
    color: 'from-purple-600 to-pink-500',
    tag: 'STEREOSCOPIC 3D',
    image: '/images/consoles/3ds.webp',
  },
  'Wii U': {
    name: 'Wii U',
    year: 2012,
    description: 'Second Screen Gaming',
    color: 'from-cyan-600 to-blue-500',
    tag: 'SECOND SCREEN',
    image: '/images/consoles/wiiu.webp',
  },
  'Nintendo Wii': {
    name: 'Nintendo Wii',
    year: 2006,
    description: 'Motion Control Magic',
    color: 'from-emerald-600 to-teal-500',
    tag: 'MOTION CONTROL',
    image: '/images/consoles/wii.webp',
  },
  'Game Boy Advance': {
    name: 'Game Boy Advance',
    year: 2001,
    description: '32-Bit Handheld',
    color: 'from-amber-600 to-orange-500',
    tag: '32-BIT HANDHELD',
    image: '/images/consoles/gba.webp',
  },
  'Game Boy Color': {
    name: 'Game Boy Color',
    year: 1998,
    description: 'Kleur Handheld',
    color: 'from-rose-600 to-pink-500',
    tag: 'KLEUR HANDHELD',
    image: '/images/consoles/gbc.webp',
  },
};

// Build platforms dynamically from products.json
function buildPlatformsFromProducts(): Platform[] {
  const allProducts = getAllProducts();

  // Get all unique console platforms (isConsole = true)
  const consolePlatforms = new Map<string, number>();
  allProducts.forEach(product => {
    if (product.isConsole) {
      consolePlatforms.set(
        product.platform,
        (consolePlatforms.get(product.platform) || 0) + 1
      );
    }
  });

  // Build platform objects with game counts
  const platforms: Platform[] = Array.from(consolePlatforms.entries())
    .map(([platformName, count]) => {
      const config = PLATFORM_CONFIG[platformName];
      if (!config) {
        // Fallback for unmapped platforms
        return {
          id: platformName.toLowerCase().replace(/\s+/g, '-'),
          name: platformName,
          year: 2000,
          gameCount: count,
          description: 'Nintendo Platform',
          color: 'from-slate-600 to-slate-500',
          tag: 'PLATFORM',
        };
      }
      return {
        id: platformName.toLowerCase().replace(/\s+/g, '-'),
        ...config,
        gameCount: count,
      };
    })
    .sort((a, b) => {
      // Sort by year descending (newer first)
      return b.year - a.year;
    });

  return platforms;
}

// Get default platforms (fallback if buildPlatformsFromProducts fails)
function getDefaultPlatforms(): Platform[] {
  return [
    {
      id: 'ds',
      name: 'Nintendo DS',
      year: 2004,
      gameCount: 48,
      description: 'Dual Screen Revolution',
      color: 'from-blue-600 to-cyan-500',
      tag: 'DUAL SCREEN',
    },
    {
      id: '3ds',
      name: 'Nintendo 3DS',
      year: 2011,
      gameCount: 46,
      description: 'Stereoscopic 3D',
      color: 'from-purple-600 to-pink-500',
      tag: 'STEREOSCOPIC 3D',
    },
    {
      id: 'wiiu',
      name: 'Wii U',
      year: 2012,
      gameCount: 22,
      description: 'Second Screen Gaming',
      color: 'from-cyan-600 to-blue-500',
      tag: 'SECOND SCREEN',
    },
    {
      id: 'wii',
      name: 'Nintendo Wii',
      year: 2006,
      gameCount: 11,
      description: 'Motion Control Magic',
      color: 'from-emerald-600 to-teal-500',
      tag: 'MOTION CONTROL',
    },
    {
      id: 'gba',
      name: 'Game Boy Advance',
      year: 2001,
      gameCount: 8,
      description: '32-Bit Handheld',
      color: 'from-amber-600 to-orange-500',
      tag: '32-BIT HANDHELD',
    },
    {
      id: 'gbc',
      name: 'Game Boy Color',
      year: 1998,
      gameCount: 6,
      description: 'Kleur Handheld',
      color: 'from-rose-600 to-pink-500',
      tag: 'KLEUR HANDHELD',
    },
  ];
}

export default function PlatformShowcase({ platforms }: PlatformShowcaseProps) {
  // Dynamically build platforms from products.json
  const displayPlatforms = platforms || (() => {
    try {
      return buildPlatformsFromProducts();
    } catch (error) {
      console.warn('Failed to build platforms from products', error);
      return getDefaultPlatforms();
    }
  })();

  // Sort platforms: DS and 3DS first (large cards), rest after (medium cards)
  const largeCards = displayPlatforms.filter(
    (p) => p.name === 'Nintendo DS' || p.name === 'Nintendo 3DS'
  );
  const mediumCards = displayPlatforms.filter(
    (p) => p.name !== 'Nintendo DS' && p.name !== 'Nintendo 3DS'
  );
  const orderedPlatforms = [...largeCards, ...mediumCards];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
        mass: 1,
        delay: index * 0.08,
      },
    }),
  };

  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-slate-50/30 to-transparent dark:from-transparent dark:via-slate-900/20 dark:to-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Ontdek per Platform
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Van klassieke Game Boy tot moderne 3DS — alle Nintendo generaties in één plek
          </p>
        </motion.div>

        {/* Platforms Grid - 2 Large Cards + 4 Medium Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="space-y-6"
        >
          {/* Top 2 Large Cards: DS and 3DS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orderedPlatforms.slice(0, 2).map((platform, index) => (
              <motion.div
                key={platform.id}
                custom={index}
                variants={itemVariants}
              >
                <PlatformCardLarge platform={platform} />
              </motion.div>
            ))}
          </div>

          {/* Bottom 4 Medium Cards: Wii U, Wii, GBA, GBC */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {orderedPlatforms.slice(2).map((platform, index) => (
              <motion.div
                key={platform.id}
                custom={index + 2}
                variants={itemVariants}
              >
                <PlatformCardMedium platform={platform} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-16"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-lg shadow-lg hover:shadow-emerald-500/30 transition-all"
          >
            Bekijk Alle Games
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

interface PlatformCardLargeProps {
  platform: Platform;
}

function PlatformCardLarge({ platform }: PlatformCardLargeProps) {
  return (
    <Link href={`/shop?platform=${encodeURIComponent(platform.name)}`}>
      <motion.div
        whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
        className="group relative overflow-hidden rounded-3xl cursor-pointer h-full min-h-80"
      >
        {/* Animated gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 to-slate-900/20 dark:from-slate-900/60 dark:to-slate-900/40" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-8 lg:p-12">
          {/* Top section */}
          <div>
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-6 bg-gradient-to-r ${platform.color} text-white shadow-lg`}
            >
              • {platform.tag}
            </motion.div>

            {/* Name & Year */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-4xl lg:text-5xl font-black text-white mb-2 leading-tight">
                {platform.name}
              </h3>
              <p className="text-sm font-semibold text-slate-300 opacity-75">{platform.year}</p>
            </motion.div>
          </div>

          {/* Bottom section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-end justify-between"
          >
            <div>
              <p className="text-emerald-400 font-bold text-xl mb-2">{platform.gameCount} games</p>
              <p className="text-slate-300 text-sm font-medium">{platform.description}</p>
            </div>
          </motion.div>
        </div>

        {/* Animated border on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${platform.color} opacity-0 pointer-events-none`}
          style={{
            boxShadow: `inset 0 0 2px rgba(255,255,255,0.3)`,
          }}
        />
      </motion.div>
    </Link>
  );
}

interface PlatformCardMediumProps {
  platform: Platform;
}

function PlatformCardMedium({ platform }: PlatformCardMediumProps) {
  return (
    <Link href={`/shop?platform=${encodeURIComponent(platform.name)}`}>
      <motion.div
        whileHover={{
          y: -6,
          scale: 1.02,
          transition: { type: 'spring', stiffness: 300, damping: 25 },
        }}
        className="group relative overflow-hidden rounded-2xl cursor-pointer h-full min-h-64"
      >
        {/* Animated gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 to-slate-900/20 dark:from-slate-900/60 dark:to-slate-900/40" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6">
          {/* Top section */}
          <div>
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-3 bg-gradient-to-r ${platform.color} text-white shadow-lg`}
            >
              • {platform.tag.split(' ')[0]}
            </motion.div>

            {/* Name */}
            <h3 className="text-2xl lg:text-3xl font-black text-white mb-1 leading-tight">
              {platform.name}
            </h3>
            <p className="text-xs text-slate-300 opacity-75">{platform.year}</p>
          </div>

          {/* Bottom section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex flex-col">
              <p className="text-emerald-400 font-bold text-lg">{platform.gameCount}</p>
              <p className="text-slate-400 text-xs">games</p>
            </div>
          </motion.div>
        </div>

        {/* Animated border on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${platform.color} opacity-0 pointer-events-none`}
          style={{
            boxShadow: `inset 0 0 2px rgba(255,255,255,0.3)`,
          }}
        />
      </motion.div>
    </Link>
  );
}
