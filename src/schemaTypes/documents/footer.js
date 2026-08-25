import { asciiArtFields } from "../objects/asciiArtFields";

export default {
  name: "footer",
  title: "Footer",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "asciiLeft", title: "ASCII art (left)" },
    { name: "ascii", title: "ASCII art" },
  ],
  fields: [
    {
      name: "navigation",
      title: "Navigation",
      type: "object",
      group: "content",
      fields: [
        { name: "title", title: "Title", type: "string" },
        { name: "availability", title: "Availability", type: "availability" },
        {
          name: "items",
          title: "Items",
          type: "array",
          of: [
            {
              type: "object",
              name: "footerNavItem",
              fields: [
                { name: "text", title: "Text", type: "string" },
                { name: "link", title: "Link", type: "link" },
              ],
            },
          ],
        },
      ],
    },
    { name: "contactInformation", title: "Contact information", type: "richText", group: "content" },
    { name: "copyrightNotice", title: "Copyright notice", type: "richText", group: "content" },
    { name: "showWatermark", title: "Show watermark", type: "boolean", group: "content" },
    { name: "spotsRemaining", title: "Spots remaining", type: "number", group: "content" },
    ...asciiArtFields("Left").map((f) => ({ ...f, group: "asciiLeft" })),
    ...asciiArtFields("").map((f) => ({ ...f, group: "ascii" })),
  ],
  preview: {
    prepare() {
      return { title: "Footer" };
    },
  },
};
