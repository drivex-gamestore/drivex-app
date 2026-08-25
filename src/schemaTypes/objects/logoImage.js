export default {
  name: "logoImage",
  title: "Image Logo",
  type: "object",
  fields: [
    { name: "image", title: "Logo image", type: "customImage" },
    { name: "alt", title: "Alt text", type: "string" },
    {
      name: "variant",
      title: "Variant",
      type: "string",
      options: { list: ["horizontal", "square", "vertical"] },
      initialValue: "horizontal",
    },
  ],
  preview: {
    select: { title: "alt", media: "image" },
  },
};
