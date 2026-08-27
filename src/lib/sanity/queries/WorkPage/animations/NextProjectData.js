import { sanityClient } from "@lib/sanity/client";

const imageProjection = `{
  "_id": asset->_id, "_rev": asset->_rev,
  "altText": coalesce(alt, asset->altText), "crop": crop,
  "description": asset->description, "dimensions": asset->metadata.dimensions,
  "hotspot": hotspot, "lqip": asset->metadata.lqip, "title": asset->title
}`;


const NEXT_PROJECT_QUERY = `{
  "all": *[_type == "project"] | order(_createdAt asc){
    "slug": slug.current,
    title,
    "mainImage": coalesce(
      mainImage{ type, aspectRatio, highResolution, "image": image${imageProjection}, video, externalVideoUrl, videoOptions },
      { "type": "image", "aspectRatio": image.asset->metadata.dimensions.aspectRatio, "image": image${imageProjection} }
    )
  }
}`;

export async function getNextProject(slug) {
  const { all } = await sanityClient.fetch(NEXT_PROJECT_QUERY, {}, { next: { revalidate: 60 } });

  if (!all?.length) return null;

  const currentIndex = all.findIndex((p) => p.slug === slug);
  if (currentIndex === -1) return null;

  const next = all[(currentIndex + 1) % all.length];
  if (!next || next.slug === slug) return null; 

  return {
    uri: `/work/${next.slug}`,
    title: next.title,
    mainImage: next.mainImage,
  };
}
