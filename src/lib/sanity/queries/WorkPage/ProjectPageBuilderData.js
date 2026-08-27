import { sanityClient } from "@lib/sanity/client";

const PAGE_BUILDER_QUERY = `*[_type == "project" && slug.current == $slug][0]{
  pageBuilder[]{
    _key,
    sectionType,
    enabled,
    "contentBlockId": contentBlockRef._ref,
    "mediaSectionId": mediaSectionRef._ref
  }
}`;


export async function getProjectPageBuilderSections(slug) {
  const data = await sanityClient.fetch(
    PAGE_BUILDER_QUERY,
    { slug },
    { next: { revalidate: 60 } }
  );

  return data?.pageBuilder?.length ? data.pageBuilder : [];
}
