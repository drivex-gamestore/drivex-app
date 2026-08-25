export default {
  name: "indexedGridSection",
  title: "Indexed Grid Section",
  type: "document",
  fields: [
    { name: "headline", title: "Headline", type: "headline" },
    { name: "text", title: "Text", type: "text" },
    { name: "label", title: "Label", type: "string" },
    { name: "variant", title: "Variant", type: "string" },
    {
      name: "items",
      title: "Items",
      type: "array",
      of: [
        {
          type: "object",
          name: "indexedGridItem",
          fields: [
            {
              name: "caseStudy",
              title: "Case study",
              type: "reference",
              to: [{ type: "project" }],
            },
            { name: "title", title: "Title", type: "string" },
            { name: "description", title: "Description", type: "text" },
          ],
          preview: { select: { title: "title" } },
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return { title: "Indexed Grid Section" };
    },
  },
};
