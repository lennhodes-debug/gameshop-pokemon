import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import TrustStrip from '@/components/home/TrustStrip';
import FeaturedProducts from '@/components/home/FeaturedProducts';

const PlatformGrid = dynamic(() => import('@/components/home/PlatformGrid'));
const ReviewsStrip = dynamic(() => import('@/components/home/ReviewsStrip'));
const ProcessTimeline = dynamic(() => import('@/components/home/ProcessTimeline'));
const AboutPreview = dynamic(() => import('@/components/home/AboutPreview'));
const FaqPreview = dynamic(() => import('@/components/home/FaqPreview'));
const NewsletterCTA = dynamic(() => import('@/components/home/NewsletterCTA'));

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <FeaturedProducts />
      <PlatformGrid />
      <ReviewsStrip />
      <ProcessTimeline />
      <AboutPreview />
      <FaqPreview />
      <NewsletterCTA />
    </>
  );
}
