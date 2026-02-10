import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import TrustStrip from '@/components/home/TrustStrip';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import SectionDivider from '@/components/ui/SectionDivider';

// Below-the-fold componenten — lazy loaded
const GamingEraTimeline = dynamic(() => import('@/components/home/GamingEraTimeline'));
const GameSeriesShowcase = dynamic(() => import('@/components/home/GameSeriesShowcase'));
const CollectibleShowcase = dynamic(() => import('@/components/home/CollectibleShowcase'));

// Boot sequence — eenmalig per sessie
const BootSequence = dynamic(() => import('@/components/home/BootSequence'));

// Console Museum — scroll-driven 3D showcase
const ConsoleMuseum = dynamic(() => import('@/components/home/ConsoleMuseum'));

// Scroll achievements — retro game popup systeem
const ScrollAchievements = dynamic(() => import('@/components/home/ScrollAchievements'));

// Color Worlds — achtergrondkleur morpht mee met scroll
const ColorWorldBackground = dynamic(() => import('@/components/home/ColorWorldBackground'));

// Lazy load componenten die niet boven de fold staan (met SSR voor SEO)
const GameMarquee = dynamic(() => import('@/components/home/GameMarquee'));
const PlatformGrid = dynamic(() => import('@/components/home/PlatformGrid'));
const AboutPreview = dynamic(() => import('@/components/home/AboutPreview'));
const ReviewsStrip = dynamic(() => import('@/components/home/ReviewsStrip'));
const FaqPreview = dynamic(() => import('@/components/home/FaqPreview'));
const NewsletterCTA = dynamic(() => import('@/components/home/NewsletterCTA'));
const PlatformSpotlight = dynamic(() => import('@/components/home/PlatformSpotlight'));

export default function HomePage() {
  return (
    <>
      <BootSequence />
      <ScrollAchievements />
      <ColorWorldBackground />
      <Hero />
      <TrustStrip />
      <SectionDivider variant="trust-to-products" />
      <FeaturedProducts />
      <SectionDivider variant="products-to-eras" />
      <GamingEraTimeline />
      <SectionDivider variant="eras-to-series" />
      <GameSeriesShowcase />
      <SectionDivider variant="series-to-value" />
      <CollectibleShowcase />
      <SectionDivider variant="value-to-showcase" />
      <ConsoleMuseum />
      <GameMarquee />
      <SectionDivider variant="showcase-to-platforms" />
      <PlatformGrid />
      <AboutPreview />
      <PlatformSpotlight />
      <ReviewsStrip />
      <FaqPreview />
      <NewsletterCTA />
    </>
  );
}
