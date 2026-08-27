import { sanityClient } from "@lib/sanity/client";

const imageProjection = `{
  "_id": asset->_id, "_rev": asset->_rev,
  "altText": coalesce(alt, asset->altText), "crop": crop,
  "description": asset->description, "dimensions": asset->metadata.dimensions,
  "hotspot": hotspot, "lqip": asset->metadata.lqip, "title": asset->title
}`;

const HERO_QUERY = `*[_type == "heroSection" && slug.current == $slug][0]{
  _id, title, tags,
  "hero": {
    "media": coalesce(content.media{ type, aspectRatio, highResolution, "image": image${imageProjection}, video, externalVideoUrl, videoOptions },
      { "type": "image", "aspectRatio": content.image.asset->metadata.dimensions.aspectRatio, "image": content.image${imageProjection} }),
    "mobileImage": content.mobileImage${imageProjection},
    "headline": content.headline, 
    "headlineLevel": content.headlineLevel, 
    "headlineDisplay": content.headlineDisplay,
    "subtext": content.subtext,
    "ctas": content.ctas{ layout, gap, buttons[]{ _key, variant, theme, size, "link": link{canDownload,href,modalId,openInNewTab,text,type} } },
    "scrollText": coalesce(content.scrollText, title),
    "useWatermark": content.useWatermark
  }
}`;

export async function getHeroSectionData(slug) {
  return sanityClient.fetch(HERO_QUERY, { slug }, { next: { revalidate: 60 } });
}
