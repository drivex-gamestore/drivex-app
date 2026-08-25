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

const linkProjection = `{
  canDownload,
  href,
  modalId,
  openInNewTab,
  text,
  type
}`;

const FEATURED_WORK_QUERY = `*[_type == "featuredWorkSection"][0]{
  theme,
  pageBuilderSection,
  className,
  "content": {
    "headline": content.headline,
    "text": content.text,
    "paddingTop": content.paddingTop,
    "paddingBottom": content.paddingBottom,
    "viewAllButton": content.viewAllButton{
      "link": link${linkProjection},
      size,
      theme,
      variant
    },
    "caseStudies": content.caseStudies[]->{
      _id,
      title,
      "uri": "/work/" + slug.current,
      tags,
      "thumbnail": image${imageProjection},
      "featuredMedia": {
        "type": "image",
        "aspectRatio": image.asset->metadata.dimensions.aspectRatio,
        "highResolution": false,
        "image": image${imageProjection},
        "video": null,
        "externalVideoUrl": null,
        "videoOptions": null
      }
    }
  }
}`;

export async function getFeaturedWorkSectionData() {
  return sanityClient.fetch(FEATURED_WORK_QUERY, {}, { next: { revalidate: 60 } });
}
