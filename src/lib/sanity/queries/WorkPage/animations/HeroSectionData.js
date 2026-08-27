import { sanityClient } from "@lib/sanity/client";

const imageProjection = `{
  "_id": asset->_id, "_rev": asset->_rev,
  "altText": coalesce(alt, asset->altText), "crop": crop,
  "description": asset->description, "dimensions": asset->metadata.dimensions,
  "hotspot": hotspot, "lqip": asset->metadata.lqip, "title": asset->title
}`;

const HERO_QUERY = `*[_type == "project" && slug.current == $slug][0]{
  _id, title, tags,
  "hero": {
    "media": coalesce(mainImage{ type, aspectRatio, highResolution, "image": image${imageProjection}, video, externalVideoUrl, videoOptions },
      { "type": "image", "aspectRatio": image.asset->metadata.dimensions.aspectRatio, "image": image${imageProjection} }),
    "mobileImage": hero.mobileImage${imageProjection},
    "headline": hero.headline,
    "headlineLevel": hero.headlineLevel,
    "headlineDisplay": hero.headlineDisplay,
    "subtext": hero.subtext,
    "ctas": hero.ctas{ layout, gap, buttons[]{ _key, variant, theme, size, "link": link{canDownload,href,modalId,openInNewTab,text,type} } },
    "scrollText": coalesce(hero.scrollText, title),
    "useWatermark": hero.useWatermark
  }
}`;

export async function getHeroSectionData(slug) {
  return sanityClient.fetch(HERO_QUERY, { slug }, { next: { revalidate: 60 } });
}
