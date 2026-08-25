import HeroTextOnly from '@routes/components/HeroTextOnly';
import { getHeroSectionData } from "@lib/sanity/queries/WorkPage/HeroSectionData";

export default async function HeroSection() {
  const data = await getHeroSectionData();

  if (!data) return null;

  return (
    <section
      data-theme="light"
      data-page-builder-section="heroSection"
      className="relative bg-background pt-64 lg:pt-128 pb-24 lg:pb-48"
    >
      <HeroTextOnly
        headline={data.headline}
        headlineLevel={data.headlineLevel}
        headlineDisplay={data.headlineDisplay}
        subtext={data.subtext}
      />
    </section>
  );
}
