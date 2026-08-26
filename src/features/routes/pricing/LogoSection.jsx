import { getLogoSectionData } from "@lib/sanity/queries/AboutPage/LogoSectionData";
import LogoSectionContent from "@routes/components/LogoSectionContent";

const SECTION_CLASS_NAME = "bg-background pt-48 lg:pt-96 pb-16 lg:pb-32";

export default async function LogoSection() {
  const data = await getLogoSectionData();

  if (!data || !data.trustedBy) return null;

  const theme = data.theme ?? "light";

  return (
    <section
      data-theme={theme}
      data-page-builder-section="logoSection"
      data-selector="pricing-logo-section"
      className={SECTION_CLASS_NAME}
    >
      <LogoSectionContent trustedBy={data.trustedBy} theme={theme} />
    </section>
  );
}
