import { sanityClient } from "@lib/sanity/client";

const HERO_QUERY = `*[_type == "pricing-hero"][0]{
  "headline": content.headline,
  "headlineLevel": content.headlineLevel,
  "headlineDisplay": content.headlineDisplay,
  "subtext": content.subtext
}`;

export async function getHeroSectionData() {
  return sanityClient.fetch(HERO_QUERY, {}, { next: { revalidate: 60 } });
}