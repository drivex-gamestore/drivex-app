import { getAboutHeroSectionData } from "@lib/sanity/queries/AboutPage/AboutHeroSectionData";
import HeroParallax from "@routes/components/HeroParallax";

const SECTION_CLASS_NAME = "relative overflow-hidden bg-background pt-0 pb-0";
const HERO_THEME = "dark";

export default async function AboutHeroSection() {
  const data = await getAboutHeroSectionData();

  if (!data || !data.media) return null;

  return (
    <section
      data-theme={HERO_THEME}
      data-page-builder-section="heroSection"
      data-selector="about-hero"
      className={SECTION_CLASS_NAME}
    >
      <HeroParallax
        media={data.media}
        mobileImage={data.mobileImage}
        headline={data.headline}
        headlineLevel={data.headlineLevel}
        headlineDisplay={data.headlineDisplay}
        subtext={data.subtext}
        ctas={data.ctas}
        scrollText={data.scrollText}
        useWatermark={data.useWatermark}
      />
    </section>
  );
}
