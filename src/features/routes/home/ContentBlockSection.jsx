
import { cx } from '@lib/vendor';
import { AnimatedHeadline } from "@features/animations/components/AnimatedHeadline";
import { SanityMedia } from "@lib/sanity/components/SanityMedia";
import { SanityRichText } from "@lib/sanity/components/SanityRichText";
import { SanityButton } from "@lib/sanity/components/SanityButton";
import { getContentBlockSectionData } from "@lib/sanity/queries/HomePage/ContentBlockSectionData";



export default async function ContentBlockSection({ id }) {
  const data = await getContentBlockSectionData(id);

  if (!data) return null;

  const {
    theme,
    selector,
    className,
    layout = "mediaLeft",
    headline,
    headlineDisplay,
    secondaryHeadline,
    media,
    text,
    primaryCta,
    secondaryCta,
    footnote,
  } = data;

  const mediaFirst = layout !== "mediaRight";

  const mediaColumn = media ? (
    <div className="grid-span-12 lg:grid-span-6 lg:grid-start-1 ">
      <div className="flex h-full flex-col justify-start items-start gap-80">
        <div>
          <div>
            <AnimatedHeadline as="h2" trigger="scroll" displayAs={headlineDisplay}>
              {headline?.text}
            </AnimatedHeadline>
          </div>
        </div>
        <div className="max-lg:!max-w-full w-full h-full">
          <div className="overflow-hidden h-full" style={{ aspectRatio: "16 / 9" }}>
            <SanityMedia media={media} className="size-full" />
          </div>
        </div>
      </div>
    </div>
  ) : null;

  const textColumn = (
    <div className="grid-span-12 lg:grid-span-4 lg:grid-start-8 ">
      <div className="flex h-full flex-col justify-between items-start gap-16">
        {secondaryHeadline?.text && (
          <div>
            <div>
              <AnimatedHeadline as="h4" trigger="scroll">
                {secondaryHeadline.text}
              </AnimatedHeadline>
            </div>
          </div>
        )}

        {text && (
          <div className="prose">
            <SanityRichText value={text} />
          </div>
        )}

        {(primaryCta?.link?.href || secondaryCta?.link?.modalId || secondaryCta?.link?.href) && (
          <div>
            <div className="flex items-start flex-col gap-16">
              {primaryCta?.link?.href && (
                <SanityButton button={{ ...primaryCta, variant: "link" }} />
              )}
              {(secondaryCta?.link?.modalId || secondaryCta?.link?.href) && (
                <SanityButton
                  button={{ size: "sm", theme: "light", ...secondaryCta }}
                />
              )}
            </div>
          </div>
        )}

        {footnote && <p className="!text-foreground">{footnote}</p>}
      </div>
    </div>
  );

  return (
    <section
      data-theme={theme}
      data-page-builder-section={true}
      data-selector={selector || undefined}
      className={cx(
        "pt-64 lg:pt-128 pb-64 lg:pb-128 bg-background",
        className
      )}
    >
      <div className="grid-container">
        <div className="grid-layout gap-y-48">
          {mediaFirst ? (
            <>
              {mediaColumn}
              {textColumn}
            </>
          ) : (
            <>
              {textColumn}
              {mediaColumn}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
