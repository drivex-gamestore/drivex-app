import { sanityClient } from "@lib/sanity/client";

const INDEXED_GRID_QUERY = `*[_type == "indexedGridSection"][0]{
  _id,
  _type,
  headline {
    level,
    text
  },
  text,
  label,
  items[]{
    _key,
    "caseStudy": caseStudy->{
      title
    },
    title,
    description
  },
  variant
}`;

export async function getIndexedGridSectionData() {
  return sanityClient.fetch(INDEXED_GRID_QUERY, {}, { next: { revalidate: 60 } });
}
