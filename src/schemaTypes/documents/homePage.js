export default {
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    {
      name: "pageBuilder",
      title: "Sections",
      description: "Drag to reorder. Toggle Enabled to show/hide without deleting.",
      type: "array",
      of: [
        {
          type: "object",
          name: "pageBuilderItem",
          title: "Section",
          fields: [
            {
              name: "sectionType",
              title: "Section type",
              type: "string",
              options: {
                list: [
                  { title: "Hero", value: "heroSection" },
                  { title: "Cards", value: "cardsSection" },
                  { title: "Animated list", value: "animatedListSection" },
                  { title: "Featured work", value: "featuredWorkSection" },
                  { title: "Indexed grid", value: "indexedGridSection" },
                  { title: "Accordion", value: "accordionSection" },
                  { title: "Content block", value: "contentBlockSection" },
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: "contentBlockRef",
              title: "Content block instance",
              description: "Required only when Section type = Content block (content block documents are reusable, so pick which one goes here).",
              type: "reference",
              to: [{ type: "contentBlockSection" }],
              hidden: ({ parent }) => parent?.sectionType !== "contentBlockSection",
            },
            {
              name: "enabled",
              title: "Enabled",
              type: "boolean",
              initialValue: true,
            },
          ],
          preview: {
            select: {
              sectionType: "sectionType",
              enabled: "enabled",
              refTitle: "contentBlockRef.content.headline.text",
            },
            prepare({ sectionType, enabled, refTitle }) {
              return {
                title: refTitle ? `${sectionType} — ${refTitle}` : sectionType || "Untitled section",
                subtitle: enabled === false ? "Hidden" : "Visible",
              };
            },
          },
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return { title: "Home Page" };
    },
  },
};
