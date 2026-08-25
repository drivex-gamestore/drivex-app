export default {
  name: "linkField",
  title: "Link",
  type: "object",
  fields: [
    {
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Internal", value: "internal" },
          { title: "External", value: "external" },
          { title: "Email", value: "email" },
          { title: "Download", value: "download" },
          { title: "Modal", value: "modal" },
        ],
      },
    },
    { name: "text", title: "Text", type: "string" },
    { name: "href", title: "URL", type: "string" },
    { name: "email", title: "Email", type: "string" },
    { name: "openInNewTab", title: "Open in new tab", type: "boolean" },
    { name: "canDownload", title: "Can download", type: "boolean" },
    { name: "modalId", title: "Modal ID", type: "string" },
  ],
};
