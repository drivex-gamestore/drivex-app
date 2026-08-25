import { ScrollAnimatedHeadline } from "@animations/components/ScrollAnimatedHeadline";
import AccordionClient from "@routes/components/AccordionClient";
import { getAccordionSectionData } from "@lib/sanity/queries/HomePage/AccordionSectionData";

export default async function AccordionSection() {
  const data = await getAccordionSectionData();

  if (!data?.content?.items?.length) {
    return null;
  }

  const { headline, allowMultiple, items } = data.content;

  return (
    <section
      data-theme={data.theme}
      data-page-builder-section="accordionSection"
      className={data.className || "bg-background py-64 lg:py-96"}
    >
      <div className="grid-container">
        <div className="grid-layout">
          <div className="grid-span-12 lg:grid-span-4 sticky top-0 z-10 -mx-(--site-grid-margin) bg-background px-(--site-grid-margin) pt-header pb-32 lg:top-header lg:z-auto lg:mx-0 lg:bg-transparent lg:px-0 lg:pt-32">
            <ScrollAnimatedHeadline
              headline={{
                text: headline?.text || "Common questions",
                level: headline?.level ?? "h2",
              }}
            />
          </div>

          <div className="grid-span-12 lg:grid-span-6 lg:grid-start-6 mt-48 lg:mt-0">
            <AccordionClient items={items} allowMultiple={allowMultiple} />
          </div>
        </div>
      </div>
    </section>
  );
}
