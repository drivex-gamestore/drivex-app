export default {
  name: "featuredWorkSection",
  title: "Featured Work Section",
  type: "document",
  fields: [
    { name: "theme", title: "Theme", type: "string" },
    { name: "pageBuilderSection", title: "Page builder section", type: "string" },
    { name: "className", title: "Custom class name", type: "string" },
    {
      name: "content",
      title: "Content",
      type: "object",
      fields: [
        { name: "headline", title: "Headline", type: "string" },
        { name: "text", title: "Text", type: "text" },
        { name: "paddingTop", title: "Padding top", type: "string" },
        { name: "paddingBottom", title: "Padding bottom", type: "string" },
        {
          name: "viewAllButton",
          title: "View all button",
          type: "object",
          fields: [
            { name: "link", title: "Link", type: "link" },
            { name: "size", title: "Size", type: "string" },
            { name: "theme", title: "Theme", type: "string" },
            { name: "variant", title: "Variant", type: "string" },
          ],
        },
        {
          name: "caseStudies",
          title: "Case studies",
          type: "array",
          of: [{ type: "reference", to: [{ type: "project" }] }],
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return { title: "Featured Work Section" };
    },
  },
};
