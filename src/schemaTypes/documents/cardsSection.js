export default {
  name: "cardsSection",
  title: "Cards Section",
  type: "document",
  fields: [
    { name: "theme", title: "Theme", type: "string" },
    { name: "pageBuilderSection", title: "Page builder section", type: "string" },
    { name: "className", title: "Custom class name", type: "string" },
    { name: "fullHeight", title: "Full height", type: "boolean" },
    {
      name: "content",
      title: "Content",
      type: "object",
      fields: [
        {
          name: "cards",
          title: "Cards",
          type: "array",
          of: [
            {
              type: "object",
              name: "textCard",
              title: "Text card",
              fields: [
                { name: "cardTheme", title: "Card theme", type: "string" },
                { name: "headline", title: "Headline", type: "headline" },
                { name: "headlineDisplay", title: "Headline display", type: "string" },
                { name: "plainText", title: "Plain text", type: "boolean" },
                { name: "text", title: "Text", type: "text" },
              ],
              preview: { select: { title: "headline.text" } },
            },
            {
              type: "object",
              name: "mediaCard",
              title: "Media card",
              fields: [
                { name: "alt", title: "Alt text", type: "string" },
                { name: "media", title: "Media", type: "media" },
              ],
              preview: { select: { title: "alt", media: "media.image" } },
            },
          ],
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return { title: "Cards Section" };
    },
  },
};
