import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import TrustStrip from '@/components/home/TrustStrip';
import FeaturedProducts from '@/components/home/FeaturedProducts';

const ParallaxSection = dynamic(() => import('@/components/home/ParallaxSection'));
const GameCarousel3D = dynamic(() => import('@/components/home/GameCarousel3D'));
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
      <ParallaxSection speed={0.2}>
        <FeaturedProducts />
      </ParallaxSection>
      <GameCarousel3D />
      <ParallaxSection speed={0.25}>
        <PlatformGrid />
      </ParallaxSection>
      <GameMarquee />
      <ParallaxSection speed={0.2}>
        <AboutPreview />
      </ParallaxSection>
      <ReviewsStrip />
      <ParallaxSection speed={0.15}>
        <FaqPreview />
      </ParallaxSection>
      <NewsletterCTA />
    </>
  );
}
