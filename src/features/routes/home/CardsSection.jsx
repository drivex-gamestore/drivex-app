import { cx } from '@lib/vendor';
import CardsSectionClient from "@routes/components/CardsSectionClient";
import { getCardsSectionData } from "@lib/sanity/queries/HomePage/CardsSectionData";

export default async function CardsSection() {
  const data = await getCardsSectionData();

  if (!data?.cards?.length) {
    return null;
  }

  return (
  <section
    data-theme={data.theme}
    data-page-builder-section="cardsSection"
    className="bg-background pt-64 lg:pt-128 pb-64 lg:pb-12">
      <div className="grid-container">
        <div className="grid-layout">
          <div className="grid-span-12">
            <CardsSectionClient cards={data.cards} fullHeight={data.fullHeight} />
          </div>
        </div>
      </div>
    </section>
  );
}
