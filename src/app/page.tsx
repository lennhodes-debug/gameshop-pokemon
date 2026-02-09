import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import TrustStrip from '@/components/home/TrustStrip';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import SectionDivider from '@/components/ui/SectionDivider';
import GamingEraTimeline from '@/components/home/GamingEraTimeline';
import GameSeriesShowcase from '@/components/home/GameSeriesShowcase';
import CollectibleShowcase from '@/components/home/CollectibleShowcase';

// Lazy load componenten die niet boven de fold staan (met SSR voor SEO)
const GameMarquee = dynamic(() => import('@/components/home/GameMarquee'));
const PlatformGrid = dynamic(() => import('@/components/home/PlatformGrid'));
const AboutPreview = dynamic(() => import('@/components/home/AboutPreview'));
const ReviewsStrip = dynamic(() => import('@/components/home/ReviewsStrip'));
const FaqPreview = dynamic(() => import('@/components/home/FaqPreview'));
const NewsletterCTA = dynamic(() => import('@/components/home/NewsletterCTA'));

export default function HomePage() {
  return (
    <>
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
      <GameMarquee />
      <SectionDivider variant="showcase-to-platforms" />
      <PlatformGrid />
      <AboutPreview />
      <ReviewsStrip />
      <FaqPreview />
      <NewsletterCTA />
    </>
  );
}
