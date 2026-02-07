import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import TrustStrip from '@/components/home/TrustStrip';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import SectionDivider from '@/components/ui/SectionDivider';

// Lazy load componenten die niet boven de fold staan
const GameMarquee = dynamic(() => import('@/components/home/GameMarquee'), { ssr: false });
const PlatformGrid = dynamic(() => import('@/components/home/PlatformGrid'), { ssr: false });
const AboutPreview = dynamic(() => import('@/components/home/AboutPreview'), { ssr: false });
const ReviewsStrip = dynamic(() => import('@/components/home/ReviewsStrip'), { ssr: false });
const FaqPreview = dynamic(() => import('@/components/home/FaqPreview'), { ssr: false });
const NewsletterCTA = dynamic(() => import('@/components/home/NewsletterCTA'), { ssr: false });

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <SectionDivider />
      <FeaturedProducts />
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
