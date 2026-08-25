export default {
  name: "accordionSection",
  title: "Accordion Section",
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
        { name: "headline", title: "Headline", type: "headline" },
        { name: "text", title: "Text", type: "text" },
        { name: "allowMultiple", title: "Allow multiple open at once", type: "boolean" },
        {
          name: "items",
          title: "Accordion items",
          type: "array",
          of: [
            {
              type: "object",
              name: "accordionItem",
              title: "Accordion item",
              fields: [
                { name: "headline", title: "Headline", type: "string" },
                { name: "text", title: "Text", type: "richText" },
              ],
              preview: { select: { title: "headline" } },
            },
          ],
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return { title: "Accordion Section" };
    },
  },
};
