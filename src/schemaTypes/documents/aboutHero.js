export default {
  name: "about-hero",
  title: "About Hero",
  type: "document",
  fields: [
    {
      name: "content",
      title: "Content",
      type: "object",
      fields: [
        { name: "media", title: "Media (desktop)", type: "media" },
        { name: "mobileImage", title: "Mobile image", type: "customImage" },
        { name: "headline", title: "Headline", type: "string" },
        { name: "headlineLevel", title: "Headline level", type: "string" },
        { name: "headlineDisplay", title: "Headline display", type: "string" },
        { name: "subtext", title: "Subtext", type: "text" },
        {
          name: "ctas",
          title: "CTAs",
          type: "object",
          fields: [
            { name: "layout", title: "Layout", type: "string" },
            { name: "gap", title: "Gap", type: "string" },
            {
              name: "buttons",
              title: "Buttons",
              type: "array",
              of: [{ type: "ctaButton" }],
            },
          ],
        },
        { name: "scrollText", title: "Scroll text", type: "string" },
        { name: "useWatermark", title: "Use watermark", type: "boolean" },
      ],
    },
  ],
  preview: {
    prepare() {
      return { title: "About Hero" };
    },
  },
};
