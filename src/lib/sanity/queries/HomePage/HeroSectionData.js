import { sanityClient } from "@lib/sanity/client";

const imageProjection = `{
  "_id": asset->_id,
  "_rev": asset->_rev,
  "url": asset->url,
  "altText": coalesce(alt, asset->altText),
  "crop": crop,
  "description": asset->description,
  "dimensions": asset->metadata.dimensions,
  "hotspot": hotspot,
  "lqip": asset->metadata.lqip,
  "title": asset->title
}`;

const linkProjection = `{
  canDownload,
  href,
  modalId,
  openInNewTab,
  text,
  type
}`;

const HERO_QUERY = `*[_type == "heroSection"][0]{
  "headline": content.headline,
  "headlineLevel": content.headlineLevel,
  "headlineDisplay": content.headlineDisplay,
  "subtext": content.subtext,
  "ctas": content.ctas{
    layout,
    gap,
    buttons[]{
      _key,
      variant,
      theme,
      size,
      "link": link${linkProjection}
    }
  },
  "trustedBy": content.trustedBy{
    title,
    items[]{
      _key,
      _type,
      _type == "image" => {
        alt,
        variant,
        "image": image${imageProjection}
      },
      _type == "svgItem" => {
        alt,
        variant,
        svgCode
      },
      _type == "reference" => {
        "svgCode": @->svgCode,
        "alt": @->title,
        "variant": "logo"
      },
      _type == "textItem" => {
        text
      }
    }
  },
  "asciiImage": content.asciiImage${imageProjection},
  "asciiDepthMap": content.asciiDepthMap${imageProjection},
  "asciiColor": content.asciiColor,
  "asciiColorDark": content.asciiColorDark,
  "asciiCellSize": content.asciiCellSize,
  "asciiParallaxIntensity": content.asciiParallaxIntensity,
  "asciiRevealOriginX": content.asciiRevealOriginX,
  "asciiRevealOriginY": content.asciiRevealOriginY,
  "asciiMobileFallback": content.asciiMobileFallback${imageProjection}
}`;


export async function getHeroSectionData() {
  return sanityClient.fetch(HERO_QUERY, {}, { next: { revalidate: 60 } });
}
