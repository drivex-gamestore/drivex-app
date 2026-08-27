import { notFound } from "next/navigation";

import HeroSection from "@routes/general/animations/HeroSection";

import { getHeroSectionData } from "@lib/sanity/queries/WorkPage/animations/HeroSectionData";

export default async function WorkDetailPage({ params }) {
  const { slug } = await params;
  const caseStudy = await getHeroSectionData(slug);

  if (!caseStudy?.hero?.media) {
    notFound();
  }

  return <HeroSection slug={slug} caseStudy={caseStudy} />;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const caseStudy = await getHeroSectionData(slug);

  if (!caseStudy) {
    return { title: "Not found" };
  }

  return {
    title: caseStudy.title,
    description: caseStudy.hero?.subtext ?? undefined,
  };
}
