import { notFound } from "next/navigation";

import HeroSection from "@routes/general/animations/HeroSection";
import ProjectInfoSection from "@routes/work/ProjectInfoSection";

import { NextProjectSection } from "@routes/components/NextProjectSection";

import { sectionRegistry } from "@features/page-builder/sectionRegistry";

import { getHeroSectionData } from "@lib/sanity/queries/WorkPage/animations/HeroSectionData";
import { getProjectPageBuilderSections } from "@lib/sanity/queries/WorkPage/ProjectPageBuilderData";

import { getNextProject } from "@lib/sanity/queries/WorkPage/animations/NextProjectData";

function ProjectSections({ sections }) {
  return sections.map((section, index) => {
    if (section.enabled === false) return null;

    const Component = sectionRegistry[section.sectionType];
    if (!Component) {
      console.warn(
        `WorkDetailPage: no component registered for sectionType "${section.sectionType}"`
      );
      return null;
    }

    const key = section._key || `${section.sectionType}-${index}`;

    if (section.sectionType === "contentBlockSection") {
      if (!section.contentBlockId) return null;
      return <Component key={key} id={section.contentBlockId} />;
    }

    if (section.sectionType === "mediaSection") {
      if (!section.mediaSectionId) return null;
      return <Component key={key} id={section.mediaSectionId} />;
    }

    return <Component key={key} />;
  });
}

export default async function WorkDetailPage({ params }) {
  const { slug } = await params;
  const [caseStudy, sections, nextProject] = await Promise.all([
    getHeroSectionData(slug),
    getProjectPageBuilderSections(slug),
    getNextProject(slug),
  ]);

  if (!caseStudy?.hero?.media) {
    notFound();
  }

  return (
    <>
      <HeroSection slug={slug} caseStudy={caseStudy} />
      <ProjectInfoSection slug={slug} />
      <ProjectSections sections={sections} />
      {nextProject && <NextProjectSection nextProject={nextProject} />}
    </>
  );
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
