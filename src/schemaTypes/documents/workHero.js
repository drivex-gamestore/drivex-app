export default {
  name: "work-hero",
  title: "Work Hero",
  type: "document",
  fields: [
    {
      name: "content",
      title: "Content",
      type: "object",
      fields: [
        { name: "headline", title: "Headline", type: "string" },
        { name: "headlineLevel", title: "Headline level", type: "string" },
        { name: "headlineDisplay", title: "Headline display", type: "string" },
        { name: "subtext", title: "Subtext", type: "text" },
      ],
    },
  ],
  preview: {
    prepare() {
      return { title: "Work Hero" };
    },
  },
};
