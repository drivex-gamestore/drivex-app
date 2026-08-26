import HeroTextOnly from "@routes/components/HeroTextOnly";
import { getHeroSectionData } from "@lib/sanity/queries/PricingPage/HeroSectionData";

export default async function HeroSection() {
  const data = await getHeroSectionData();

  if (!data) return null;

  return (
    <section
      data-theme="light"
      data-page-builder-section="heroSection"
      data-selector="pricing-hero"
      className="relative bg-background pt-96 lg:pt-192 pb-0"
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
