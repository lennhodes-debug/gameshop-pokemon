import dynamic from 'next/dynamic';
import Script from 'next/script';
import Hero from '@/components/home/Hero';
import TrustStrip from '@/components/home/TrustStrip';
import FeaturedProducts from '@/components/home/FeaturedProducts';

const ParallaxSection = dynamic(() => import('@/components/home/ParallaxSection'));
const PlatformGrid = dynamic(() => import('@/components/home/PlatformGrid'));
const ReviewsStrip = dynamic(() => import('@/components/home/ReviewsStrip'));
const GameCarousel3D = dynamic(() => import('@/components/home/GameCarousel3D'));
const WhyChooseUs = dynamic(() => import('@/components/home/WhyChooseUs'));
const GameMarquee = dynamic(() => import('@/components/home/GameMarquee'));
const AboutPreview = dynamic(() => import('@/components/home/AboutPreview'));
const FaqPreview = dynamic(() => import('@/components/home/FaqPreview'));
const NewsletterCTA = dynamic(() => import('@/components/home/NewsletterCTA'));

export default function HomePage() {
  return (
    <>
      <Script src="/platform-intro.js" strategy="afterInteractive" />
      <Hero />
      <TrustStrip />
      <ParallaxSection speed={0.15}>
        <FeaturedProducts />
      </ParallaxSection>
      <PlatformGrid />
      <ReviewsStrip />
      <GameCarousel3D />
      <WhyChooseUs />
      <GameMarquee />
      <ParallaxSection speed={0.15}>
        <AboutPreview />
      </ParallaxSection>
      <ParallaxSection speed={0.1}>
        <FaqPreview />
      </ParallaxSection>
      <NewsletterCTA />
    </>
  );
}
