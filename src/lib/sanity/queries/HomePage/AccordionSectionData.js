import { sanityClient } from "@lib/sanity/client";

const ACCORDION_SECTION_QUERY = `*[_type == "accordionSection"][0]{
  theme,
  pageBuilderSection,
  className,
  content{
    "headline": headline{
      level,
      text
    },
    text,
    allowMultiple,
    "items": items[]{
      _key,
      headline,
      text
    }
  }
}`;

export async function getAccordionSectionData() {
  return sanityClient.fetch(ACCORDION_SECTION_QUERY, {}, { next: { revalidate: 60 } });
}
