import { sanityClient } from "@lib/sanity/client";

const PAGE_BUILDER_QUERY = `*[_type == $docType][0]{
  pageBuilder[]{
    _key,
    sectionType,
    enabled,
    "contentBlockId": contentBlockRef._ref
  }
}`;

/**
 * Fetches the ordered section list for a page-builder-driven page
 * (homePage, aboutPage, ...). Returns null if no such document exists
 * yet in Sanity, so callers can fall back to a hardcoded default order.
 *
 * @param {string} docType - the Sanity document _type, e.g. "homePage"
 */
export async function getPageBuilderSections(docType) {
  const data = await sanityClient.fetch(
    PAGE_BUILDER_QUERY,
    { docType },
    { next: { revalidate: 60 } }
  );

  return data?.pageBuilder?.length ? data.pageBuilder : null;
}
