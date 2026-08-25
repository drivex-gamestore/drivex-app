import FeaturedWorkSectionClient from "@routes/components/FeaturedWorkSectionClient";
import { getFeaturedWorkSectionData } from "@lib/sanity/queries/HomePage/FeaturedWorkSectionData";

export default async function FeaturedWorkSection() {
  const data = await getFeaturedWorkSectionData();

  if (!data?.content?.caseStudies?.length) {
    return null;
  }

  return (
<section
  data-theme="dark"
  data-page-builder-section="featuredWorkSection"
  className="bg-background pt-64 lg:pt-128 pb-64 lg:pb-128">
      <FeaturedWorkSectionClient section={data} />
    </section>
  );
}
