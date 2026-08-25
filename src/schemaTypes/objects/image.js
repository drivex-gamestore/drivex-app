export default {
  name: "customImage",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    {
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "Falls back to the asset's own alt text if left blank",
    },
  ],
};
