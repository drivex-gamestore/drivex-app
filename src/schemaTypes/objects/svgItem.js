export default {
  name: "svgItem",
  title: "SVG Logo",
  type: "object",
  fields: [
    { name: "alt", title: "Alt text", type: "string" },
    {
      name: "svgCode",
      title: "SVG code",
      type: "text",
      rows: 6,
      description:
        "Paste raw inline SVG markup. Use fill=\"currentColor\" so it inherits the theme color.",
    },
    {
      name: "variant",
      title: "Variant",
      type: "string",
      options: { list: ["horizontal", "square", "vertical"] },
      initialValue: "horizontal",
    },
  ],
  preview: {
    select: { title: "alt" },
    prepare({ title }) {
      return { title: title || "SVG logo" };
    },
  },
};
