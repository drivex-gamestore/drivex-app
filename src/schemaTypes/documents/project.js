export default {
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string" },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
    },
    { name: "image", title: "Thumbnail image", type: "customImage" },
    { name: "mainImage", title: "Main image / media", type: "media" },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    },
  ],
  preview: {
    select: { title: "title", media: "image" },
  },
};
