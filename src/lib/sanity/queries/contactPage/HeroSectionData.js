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

const linkProjection = `{
  canDownload,
  href,
  modalId,
  openInNewTab,
  text,
  type
}`;

const HERO_QUERY = `*[_type == "contact-hero"][0]{
  "headline": content.headline,
  "asciiImage": asciiImage${imageProjection},
  "contactInformation": contactInformation{
    email
  },
  "team": team[]{
    _key,
    label,
    email
  },
  "socialLinks": socialLinks[]{
    _key,
    label,
    "link": link${linkProjection}
  },
  "availability": availability{
    isAvailable,
    text
  },
  "bookCallHeading": bookCallHeading,
  "bookCallCta": bookCallCta{
    theme,
    "link": link${linkProjection}
  },
  "formHeading": formHeading
}`;

export async function getHeroSectionData() {
  return sanityClient.fetch(HERO_QUERY, {}, { next: { revalidate: 60 } });
}
