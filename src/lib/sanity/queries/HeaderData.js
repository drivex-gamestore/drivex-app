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

const HEADER_QUERY = `*[_type == "header"][0]{
  navItems[]{
    _key,
    text,
    "link": link${linkProjection}
  },
  "headerCta": headerCta${linkProjection},
  flyout{
    availability,
    centerImage{
      caption,
      "image": image${imageProjection},
      "link": link${linkProjection}
    },
    contact,
    featuredProject{
      caption,
      project->{
        _id,
        title,
        "uri": "/work/" + slug.current,
        "image": image${imageProjection}
      }
    },
    location,
    socials[]{ _key, handle, href, name },
    team[]{ _key, email, name }
  },
  spotsRemaining
}`;

export async function getHeaderData() {
  return sanityClient.fetch(HEADER_QUERY, {}, { next: { revalidate: 60 } });
}