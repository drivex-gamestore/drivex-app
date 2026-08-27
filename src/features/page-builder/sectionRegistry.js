import HeroSection from "@routes/home/HeroSection";
import CardsSection from "@routes/home/CardsSection";
import AnimatedListSection from "@routes/home/AnimatedListSection";
import FeaturedWorkSection from "@routes/home/FeaturedWorkSection";
import IndexedGridSection from "@routes/home/IndexedGridSection";
import AccordionSection from "@routes/home/AccordionSection";
import ContentBlockSection from "@routes/home/ContentBlockSection";
import AboutHeroSection from "@routes/about/AboutHeroSection";
import LogoSection from "@routes/about/LogoSection";
import StorySection from "@routes/about/StorySection";

import WorkHeroSection from "@routes/work/HeroSection";
import WorkSliderSection from "@routes/work/WorkSliderSection";
import MediaSection from "@routes/work/MediaSection";

import PricingHeroSection from "@routes/pricing/HeroSection";
import PricingLogoSection from "@routes/pricing/LogoSection";

import ContactHeroSection from "@routes/contact/HeroSection";

export const sectionRegistry = {
  heroSection: HeroSection,
  cardsSection: CardsSection,
  animatedListSection: AnimatedListSection,
  featuredWorkSection: FeaturedWorkSection,
  indexedGridSection: IndexedGridSection,
  accordionSection: AccordionSection,
  contentBlockSection: ContentBlockSection,
  aboutHero: AboutHeroSection,
  logoSection: LogoSection,
  storySection: StorySection,
  "work-hero": WorkHeroSection,
  workSliderSection: WorkSliderSection,
  mediaSection: MediaSection,
  "pricing-hero": PricingHeroSection,
  pricingLogoSection: PricingLogoSection,
  "contact-hero": ContactHeroSection,
};
