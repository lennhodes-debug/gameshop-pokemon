import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import TrustStrip from '@/components/home/TrustStrip';
import FeaturedProducts from '@/components/home/FeaturedProducts';

const PlatformIntro = dynamic(() => import('@/components/home/PlatformIntro'));
const CollectionShowcase = dynamic(() => import('@/components/home/CollectionShowcase'));
const ParallaxSection = dynamic(() => import('@/components/home/ParallaxSection'));
const GameCarousel3D = dynamic(() => import('@/components/home/GameCarousel3D'));
const PlatformGrid = dynamic(() => import('@/components/home/PlatformGrid'));
const GameMarquee = dynamic(() => import('@/components/home/GameMarquee'));
const AboutPreview = dynamic(() => import('@/components/home/AboutPreview'));
const ReviewsStrip = dynamic(() => import('@/components/home/ReviewsStrip'));
const FaqPreview = dynamic(() => import('@/components/home/FaqPreview'));
const NewsletterCTA = dynamic(() => import('@/components/home/NewsletterCTA'));

export default function HomePage() {
  return (
    <>
      <PlatformIntro />
      <Hero />
      <TrustStrip />
      <CollectionShowcase />
      <ParallaxSection speed={0.15}>
        <FeaturedProducts />
      </ParallaxSection>
      <GameCarousel3D />
      <PlatformGrid />
      <GameMarquee />
      <ParallaxSection speed={0.15}>
        <AboutPreview />
      </ParallaxSection>
      <ReviewsStrip />
      <ParallaxSection speed={0.1}>
        <FaqPreview />
      </ParallaxSection>
      <NewsletterCTA />
    </>
  );
}
