import { sanityClient } from "@lib/sanity/client";

const PROJECT_INFO_QUERY = `*[_type == "project" && slug.current == $slug][0]{
  title,
  "liveUrl": projectInfo.liveUrl,
  "meta": projectInfo.meta[]{ _key, label, value },
  "secondaryHeadline": projectInfo.secondaryHeadline{ level, text },
  "text": projectInfo.text
}`;

export async function getProjectInfoData(slug) {
  return sanityClient.fetch(
    PROJECT_INFO_QUERY,
    { slug },
    { next: { revalidate: 60 } }
  );
}
