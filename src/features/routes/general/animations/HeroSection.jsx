import { getHeroSectionData } from "@lib/sanity/queries/WorkPage/animations/HeroSectionData";
import HeroParallax from "@routes/components/HeroParallax";

const SECTION_CLASS_NAME = "relative overflow-hidden bg-background pt-0 pb-0";
const HERO_THEME = "dark";

export default async function HeroSection({ slug, caseStudy }) {
  const data = caseStudy ?? (await getHeroSectionData(slug));
  const hero = data?.hero;
  if (!data || !hero?.media) return null;

  return (
    <section data-theme={HERO_THEME} data-page-builder-section="heroSection" data-selector="animation-heroSection" className={SECTION_CLASS_NAME}>
      <HeroParallax
        media={hero.media}
        mobileImage={hero.mobileImage}
        headline={hero.headline}
        headlineLevel={hero.headlineLevel}
        headlineDisplay={hero.headlineDisplay}
        subtext={hero.subtext}
        ctas={hero.ctas}
        scrollText={hero.scrollText}
        useWatermark={hero.useWatermark}
      />
    </section>
  );
}
