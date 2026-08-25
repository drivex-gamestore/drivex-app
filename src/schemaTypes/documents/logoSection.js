export default {
  name: "logoSection",
  title: "Logo Section",
  type: "document",
  fields: [
    {
      name: "theme",
      title: "Theme",
      type: "string",
      options: { list: ["light", "dark"] },
      initialValue: "light",
    },
    {
      name: "trustedBy",
      title: "Trusted By",
      type: "object",
      fields: [
        { name: "title", title: "Title", type: "string" },
        {
          name: "items",
          title: "Items",
          type: "array",
          of: [{ type: "logoImage" }, { type: "svgItem" }, { type: "textItem" }],
        },
      ],
    },
  ],
  preview: {
    select: { title: "trustedBy.title" },
    prepare({ title }) {
      return { title: title || "Logo Section" };
    },
  },
};
