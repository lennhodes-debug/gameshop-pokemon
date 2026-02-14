import dynamic from 'next/dynamic';
import Script from 'next/script';
import Hero from '@/components/home/Hero';
import TrustStrip from '@/components/home/TrustStrip';
import FeaturedProducts from '@/components/home/FeaturedProducts';

const PlatformGrid = dynamic(() => import('@/components/home/PlatformGrid'));
const ReviewsStrip = dynamic(() => import('@/components/home/ReviewsStrip'));
const AboutPreview = dynamic(() => import('@/components/home/AboutPreview'));
const FaqPreview = dynamic(() => import('@/components/home/FaqPreview'));
const NewsletterCTA = dynamic(() => import('@/components/home/NewsletterCTA'));

export default function HomePage() {
  return (
    <>
      <Script src="/platform-intro.js" strategy="afterInteractive" />
      <Hero />
      <TrustStrip />
      <FeaturedProducts />
      <PlatformGrid />
      <ReviewsStrip />
      <AboutPreview />
      <FaqPreview />
      <NewsletterCTA />
    </>
  );
}
