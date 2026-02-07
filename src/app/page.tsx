import Hero from '@/components/home/Hero';
import TrustStrip from '@/components/home/TrustStrip';
import GameMarquee from '@/components/home/GameMarquee';
import PlatformGrid from '@/components/home/PlatformGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import AboutPreview from '@/components/home/AboutPreview';
import FaqPreview from '@/components/home/FaqPreview';
import NewsletterCTA from '@/components/home/NewsletterCTA';
import SectionDivider from '@/components/ui/SectionDivider';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <SectionDivider />
      <GameMarquee />
      <SectionDivider />
      <PlatformGrid />
      <SectionDivider />
      <FeaturedProducts />
      <AboutPreview />
      <NewsletterCTA />
      <FaqPreview />
    </>
  );
}
