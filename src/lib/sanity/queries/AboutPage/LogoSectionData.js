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

const LOGO_SECTION_QUERY = `*[_type == "logoSection"][0]{
  theme,
  "trustedBy": trustedBy{
    title,
    "items": items[]{
      _key,
      _type,
      _type == "logoImage" => {
        alt,
        variant,
        "image": image${imageProjection}
      },
      _type == "svgItem" => {
        alt,
        variant,
        svgCode
      },
      _type == "textItem" => {
        text
      }
    }
  }
}`;

export async function getLogoSectionData() {
  return sanityClient.fetch(LOGO_SECTION_QUERY, {}, { next: { revalidate: 60 } });
}
