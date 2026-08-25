export default {
  name: "header",
  title: "Header",
  type: "document",
  fields: [
    {
      name: "navItems",
      title: "Nav items",
      type: "array",
      of: [
        {
          type: "object",
          name: "navItem",
          fields: [
            { name: "text", title: "Text", type: "string" },
            { name: "link", title: "Link", type: "link" },
          ],
        },
      ],
    },
    { name: "headerCta", title: "Header CTA", type: "link" },
    {
      name: "flyout",
      title: "Flyout menu",
      type: "object",
      fields: [
        { name: "availability", title: "Availability", type: "availability" },
        {
          name: "centerImage",
          title: "Center image",
          type: "object",
          fields: [
            { name: "caption", title: "Caption", type: "string" },
            { name: "image", title: "Image", type: "customImage" },
            { name: "link", title: "Link", type: "link" },
          ],
        },
        { name: "contact", title: "Contact", type: "contact" },
        {
          name: "featuredProject",
          title: "Featured project",
          type: "object",
          fields: [
            { name: "caption", title: "Caption", type: "string" },
            {
              name: "project",
              title: "Project",
              type: "reference",
              to: [{ type: "project" }],
            },
          ],
        },
        { name: "location", title: "Location", type: "string" },
        {
          name: "socials",
          title: "Socials",
          type: "array",
          of: [
            {
              type: "object",
              name: "social",
              fields: [
                { name: "name", title: "Name", type: "string" },
                { name: "handle", title: "Handle", type: "string" },
                { name: "href", title: "URL", type: "url" },
              ],
            },
          ],
        },
        {
          name: "team",
          title: "Team",
          type: "array",
          of: [
            {
              type: "object",
              name: "teamMember",
              fields: [
                { name: "name", title: "Name", type: "string" },
                { name: "email", title: "Email", type: "string" },
              ],
            },
          ],
        },
      ],
    },
    { name: "spotsRemaining", title: "Spots remaining", type: "number" },
  ],
  preview: {
    prepare() {
      return { title: "Header" };
    },
  },
};
