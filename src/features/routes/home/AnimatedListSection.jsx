import { cx } from '@lib/vendor';
import AnimatedListSectionClient from "@routes/components/AnimatedListSectionClient";
import { getAnimatedListSectionData } from "@lib/sanity/queries/HomePage/AnimatedListSectionData";

export default async function AnimatedListSection() {
  const data = await getAnimatedListSectionData();

  if (!data?.items?.length) {
    return null;
  }

  return (
    <section
      data-theme="light"
      data-page-builder-section="animatedListSection"
      className="bg-background pt-64 lg:pt-128 pb-64 lg:pb-128">
      <AnimatedListSectionClient
        headline={data.headline}
        label={data.label}
        text={data.text}
        items={data.items}
        variant={data.variant}
        headlineDisplay={data.headlineDisplay}
        fixedMedia={data.fixedMedia}
      />
    </section>
  );
}
