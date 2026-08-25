import { HIGH_RES_SOURCE_WIDTHS } from "@shared/constants/constants";
import { getStorySectionData } from "@lib/sanity/queries/AboutPage/StorySectionData";
import { SanityImage } from "@lib/sanity/components/SanityImage";
import { AnimatedHeadline } from "@features/animations/components/AnimatedHeadline";
import { AnimatedProse } from "@features/animations/components/AnimatedProse";
import { AnimatedText } from "@features/animations/components/AnimatedText";

export default async function StorySection({ id, className }) {
  const data = await getStorySectionData();

  if (!data) return null;

  const { theme, selector, headline, label, text, image } = data;

  const paragraphs = text ? text.split(/\n\s*\n/) : [];

  const builderOptions = image?.highResolution
    ? { sourceWidths: HIGH_RES_SOURCE_WIDTHS }
    : undefined;

  return (
    <section
      id={id || selector || undefined}
      data-theme={theme}
      data-page-builder-section="storySection"
      data-selector={selector || undefined}
      className={
        className || data.className || "pt-64 lg:pt-128 pb-64 lg:pb-128 bg-background"
      }
    >
      <div className="grid-container">
        <div className="grid-layout gap-y-48">
          <div className="grid-span-12 lg:grid-span-3 lg:grid-start-3 order-2 lg:order-none">
            <div className="flex h-full flex-col justify-start items-start gap-24">
              <div className="max-lg:!max-w-full w-full h-full">
                <div className="overflow-hidden h-full">
                  {image?.image && (
                    <SanityImage
                      image={image.image}
                      builderOptions={builderOptions}
                      aspectRatio={image.aspectRatio}
                      className="size-full"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid-span-12 lg:grid-span-4 lg:grid-start-7 order-1 lg:order-none">
            <div className="flex h-full flex-col justify-between items-start gap-16">
              <div className="flex w-full flex-row flex-wrap items-end justify-between gap-16">
                {headline?.text && (
                  <AnimatedHeadline as={headline?.level || "h3"} trigger="scroll" className="">
                    {headline.text}
                  </AnimatedHeadline>
                )}
                {label && <p className="section-label">{label}</p>}
              </div>

              {paragraphs.length > 0 && (
                <div className="prose">
                  <AnimatedProse className="flex flex-col gap-16">
                    {paragraphs.map((paragraph, index) => (
                      <div
                        key={index}
                        className="text-body empty:hidden"
                        data-paragraph={true}
                      >
                        <AnimatedText>{paragraph}</AnimatedText>
                      </div>
                    ))}
                  </AnimatedProse>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
