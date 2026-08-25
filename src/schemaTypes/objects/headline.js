export default {
  name: "headline",
  title: "Headline",
  type: "object",
  fields: [
    {
      name: "level",
      title: "Heading level",
      type: "string",
      options: { list: ["h1", "h2", "h3", "h4"] },
    },
    { name: "text", title: "Text", type: "string" },
  ],
};
