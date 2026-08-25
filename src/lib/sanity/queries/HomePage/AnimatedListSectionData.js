import { sanityClient } from "@lib/sanity/client";

const imageProjection = `{
  "_id": asset->_id,
  "_rev": asset->_rev,
  "altText": coalesce(alt, asset->altText),
  "crop": crop,
  "description": asset->description,
  "dimensions": asset->metadata.dimensions,
  "hotspot": hotspot,
  "lqip": asset->metadata.lqip,
  "title": asset->title
}`;

const mediaProjection = `{
  type,
  aspectRatio,
  highResolution,
  "image": image${imageProjection},
  externalVideoUrl,
  videoOptions
}`;

const ANIMATED_LIST_QUERY = `*[_type == "animatedListSection"][0]{
  theme,
  pageBuilderSection,
  className,
  "headline": content.headline{
    level,
    text
  },
  "label": content.label,
  "text": content.text,
  "items": content.items[]{
    _key,
    alt,
    headline,
    "image": image${imageProjection},
    text
  },
  "variant": content.variant,
  "headlineDisplay": content.headlineDisplay,
  "fixedMedia": content.fixedMedia${mediaProjection}
}`;

export async function getAnimatedListSectionData() {
  return sanityClient.fetch(ANIMATED_LIST_QUERY, {}, { next: { revalidate: 60 } });
}