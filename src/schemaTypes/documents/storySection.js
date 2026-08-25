export default {
  name: "storySection",
  title: "Story Section",
  type: "document",
  fields: [
    { name: "theme", title: "Theme", type: "string" },
    { name: "selector", title: "Selector (optional anchor id)", type: "string" },
    { name: "className", title: "Custom class name", type: "string" },
    {
      name: "content",
      title: "Content",
      type: "object",
      fields: [
        { name: "image", title: "Image", type: "media" },
        { name: "headline", title: "Headline", type: "headline" },
        { name: "label", title: "Label", description: "e.g. // The Story", type: "string" },
        { name: "text", title: "Text (separate paragraphs with a blank line)", type: "text", rows: 10 },
      ],
    },
  ],
  preview: {
    select: { title: "content.headline.text" },
    prepare({ title }) {
      return { title: title || "Story Section" };
    },
  },
};
