export default {
  name: "workSliderSection",
  title: "Work Slider Section",
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
        { name: "theme", title: "Theme", type: "string" },
        { name: "paddingTop", title: "Padding top", type: "string" },
        { name: "paddingBottom", title: "Padding bottom", type: "string" },
        { name: "filterLabel", title: "Filter label", type: "string" },
        {
          name: "caseStudies",
          title: "Case studies",
          type: "array",
          of: [{ type: "reference", to: [{ type: "project" }] }],
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return { title: "Work Slider Section" };
    },
  },
};
