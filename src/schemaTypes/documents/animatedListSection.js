export default {
  name: "animatedListSection",
  title: "Animated List Section",
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
        { name: "label", title: "Label", type: "string" },
        { name: "text", title: "Text", type: "text" },
        { name: "variant", title: "Variant", type: "string" },
        { name: "headlineDisplay", title: "Headline display", type: "string" },
        {
          name: "items",
          title: "Items",
          type: "array",
          of: [
            {
              type: "object",
              name: "animatedListItem",
              fields: [
                { name: "alt", title: "Alt text", type: "string" },
                { name: "headline", title: "Headline", type: "string" },
                { name: "image", title: "Image", type: "customImage" },
                { name: "text", title: "Text", type: "text" },
              ],
              preview: { select: { title: "headline", media: "image" } },
            },
          ],
        },
        { name: "fixedMedia", title: "Fixed media", type: "media" },
      ],
    },
  ],
  preview: {
    prepare() {
      return { title: "Animated List Section" };
    },
  },
};
