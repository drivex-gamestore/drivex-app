export default {
  name: "media",
  title: "Media",
  type: "object",
  fields: [
    {
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video (Mux)", value: "video" },
          { title: "External video URL", value: "externalVideo" },
        ],
      },
    },
    { name: "aspectRatio", title: "Aspect ratio", type: "string" },
    { name: "highResolution", title: "High resolution", type: "boolean" },
    {
      name: "image",
      title: "Image",
      type: "customImage",
      hidden: ({ parent }) => parent?.type !== "image",
    },
    {
      name: "video",
      title: "Video",
      type: "mux.video",
      hidden: ({ parent }) => parent?.type !== "video",
    },
    {
      name: "externalVideoUrl",
      title: "External video URL",
      type: "url",
      hidden: ({ parent }) => parent?.type !== "externalVideo",
    },
    {
      name: "videoOptions",
      title: "Video options",
      type: "object",
      hidden: ({ parent }) => parent?.type === "image",
      fields: [
        { name: "autoplay", title: "Autoplay", type: "boolean" },
        { name: "loop", title: "Loop", type: "boolean" },
        { name: "muted", title: "Muted", type: "boolean" },
        { name: "controls", title: "Controls", type: "boolean" },
      ],
    },
  ],
};
