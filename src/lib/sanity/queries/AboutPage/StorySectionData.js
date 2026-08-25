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

const videoProjection = `{
  "playbackId": asset->playbackId,
  "dimensions": {
    "width": asset->data.tracks[0].max_width,
    "height": asset->data.tracks[0].max_height,
    "aspectRatio": asset->data.aspect_ratio
  },
  "thumbTime": thumbTime
}`;

const mediaProjection = `{
  type,
  aspectRatio,
  highResolution,
  "image": image${imageProjection},
  "video": video${videoProjection},
  externalVideoUrl,
  videoOptions
}`;

const STORY_SECTION_QUERY = `*[_type == "storySection"][0]{
  theme,
  selector,
  className,
  "image": content.image${mediaProjection},
  "headline": content.headline,
  "label": content.label,
  "text": content.text
}`;

export async function getStorySectionData() {
  return sanityClient.fetch(STORY_SECTION_QUERY, {}, { next: { revalidate: 60 } });
}
