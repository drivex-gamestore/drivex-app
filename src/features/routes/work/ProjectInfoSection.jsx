import { ScrollAnimatedHeadline } from "@animations/components/ScrollAnimatedHeadline";
import { AnimatedLink } from "@animations/components/AnimatedLink";
import { List } from "@animations/components/List";
import { SanityRichText } from "@lib/sanity/components/SanityRichText";
import { getProjectInfoData } from "@lib/sanity/queries/WorkPage/ProjectInfoData";

export default async function ProjectInfoSection({ slug }) {
  const data = await getProjectInfoData(slug);

  if (!data) return null;

  const { title, liveUrl, meta, secondaryHeadline, text } = data;
  const hasMeta = Array.isArray(meta) && meta.length > 0;

  if (!title && !liveUrl && !hasMeta && !secondaryHeadline?.text && !text) {
    return null;
  }

  return (
    <section
      data-theme="light"
      data-page-builder-section={true}
      className="pt-64 lg:pt-128 pb-64 lg:pb-128 bg-background"
    >
      <div className="grid-container">
        <div className="grid-layout gap-y-48">
          <div className="grid-span-12 lg:grid-span-3 lg:grid-start-2 ">
            <div className="flex h-full flex-col justify-between items-start gap-32">
              {title && (
                <div>
                  <ScrollAnimatedHeadline headline={{ level: "h1", text: title }} />
                </div>
              )}

              {liveUrl && (
                <div className="mb-auto">
                  <AnimatedLink
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    indicator
                  >
                    View Live Site
                  </AnimatedLink>
                </div>
              )}

              {hasMeta && (
                <List
                  items={meta.map((item) => ({
                    text: item.label && item.value
                      ? `${item.label}: ${item.value}`
                      : item.label || item.value || "",
                  }))}
                  animated={false}
                  pushEffect={false}
                />
              )}
            </div>
          </div>

          <div className="grid-span-12 lg:grid-span-5 lg:grid-start-7 ">
            <div className="flex h-full flex-col justify-start items-start gap-16">
              {secondaryHeadline?.text && (
                <div>
                  <ScrollAnimatedHeadline headline={secondaryHeadline} />
                </div>
              )}

              {secondaryHeadline?.text && text && (
                <div className="w-full pt-32 lg:pt-64 pb-32 lg:pb-64">
                  <hr className="w-full border-border border-t" />
                </div>
              )}

              {text && (
                <div className="prose">
                  <SanityRichText value={text} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
