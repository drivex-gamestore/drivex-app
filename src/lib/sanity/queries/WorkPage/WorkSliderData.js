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
  video,
  externalVideoUrl,
  videoOptions
}`;

const WORK_SLIDER_QUERY = `*[_type == "workSliderSection"][0]{
  theme,
  pageBuilderSection,
  className,
  "content": {
    "theme": content.theme,
    "paddingTop": content.paddingTop,
    "paddingBottom": content.paddingBottom,
    "filterLabel": content.filterLabel,
    "caseStudies": content.caseStudies[]->{
      _createdAt,
      _id,
      title,
      "uri": "/work/" + slug.current,
      tags,
      "mainImage": select(
        defined(image) => {
          "type": "image",
          "image": image${imageProjection}
        }
      )
    }
  }
}`;

export async function getWorkSliderData() {
  return sanityClient.fetch(WORK_SLIDER_QUERY, {}, { next: { revalidate: 60 } });
}
