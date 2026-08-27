import { cx } from '@lib/vendor';
import { SanityMedia } from "@lib/sanity/components/SanityMedia";
import { getMediaSectionData } from "@lib/sanity/queries/WorkPage/animations/MediaSectionData";

export default async function MediaSection({ id }) {
  const data = await getMediaSectionData(id);

  if (!data?.items?.length) return null;

  const { theme, className, items } = data;

  return (
    <section
      data-theme={theme}
      data-page-builder-section={true}
      className={cx("bg-background py-64 lg:py-96", className)}
    >
      <div className="grid-container">
        <div className="grid-layout">
          <div className="grid-span-12">
            <div className="grid grid-cols-12 gap-16">
              {items.map((item) => (
                <div
                  key={item._key}
                  className={`grid-span-12 lg:grid-span-${item.lgSpan ?? 10} lg:grid-start-${item.lgStart ?? 2}`}
                >
                  <div className="flex h-full flex-col gap-8">
                    <div className="min-h-0 flex-1">
                      <SanityMedia media={item.media} className="h-full w-full object-cover" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
