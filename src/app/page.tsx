import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import TrustStrip from '@/components/home/TrustStrip';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import SectionDivider from '@/components/ui/SectionDivider';
import GamingEraTimeline from '@/components/home/GamingEraTimeline';
import GameSeriesShowcase from '@/components/home/GameSeriesShowcase';

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
      <SectionDivider />
      <FeaturedProducts />
      <SectionDivider />
      <GamingEraTimeline />
      <SectionDivider />
      <GameSeriesShowcase />
      <SectionDivider />
      <GameMarquee />
      <SectionDivider />
      <PlatformGrid />
      <AboutPreview />
      <ReviewsStrip />
      <FaqPreview />
      <NewsletterCTA />
    </>
  );
}
