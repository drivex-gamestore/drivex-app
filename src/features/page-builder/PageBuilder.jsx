import { getPageBuilderSections } from "@lib/sanity/queries/PageBuilderData";
import { sectionRegistry } from "./sectionRegistry";
import { defaultPageOrder } from "./defaultPageOrder";

const PAGE_DOC_TYPES = {
  home: "homePage",
  about: "aboutPage",
  work: "workPage",
};


export default async function PageBuilder({ pageType }) {
  const docType = PAGE_DOC_TYPES[pageType];

  if (!docType) {
    console.warn(`PageBuilder: unknown pageType "${pageType}"`);
    return null;
  }

  const cmsSections = await getPageBuilderSections(docType);
  const sections = cmsSections ?? defaultPageOrder[pageType] ?? [];

  return sections.map((section, index) => {
    if (section.enabled === false) return null;

    const Component = sectionRegistry[section.sectionType];
    if (!Component) {
      console.warn(
        `PageBuilder: no component registered for sectionType "${section.sectionType}"`
      );
      return null;
    }

    const key = section._key || `${section.sectionType}-${index}`;


    if (section.sectionType === "contentBlockSection") {
      if (!section.contentBlockId) {
        console.warn(
          "PageBuilder: contentBlockSection entry is missing contentBlockId/contentBlockRef"
        );
        return null;
      }
      return <Component key={key} id={section.contentBlockId} />;
    }

    return <Component key={key} />;
  });
}
