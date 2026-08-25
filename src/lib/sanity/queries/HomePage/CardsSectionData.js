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

const CARDS_QUERY = `*[_type == "cardsSection"][0]{
  theme,
  pageBuilderSection,
  className,
  fullHeight,
  "cards": content.cards[]{
    _key,
    _type,
    _type == "textCard" => {
      cardTheme,
      "headline": headline{
        level,
        text
      },
      headlineDisplay,
      plainText,
      text
    },
    _type == "mediaCard" => {
      alt,
      "media": media${mediaProjection}
    }
  }
}`;

export async function getCardsSectionData() {
  return sanityClient.fetch(CARDS_QUERY, {}, { next: { revalidate: 60 } });
}
