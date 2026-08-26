import { Fragment } from "react";
import { AnimatedHeadline } from "@animations/components/AnimatedHeadline";
import { AnimatedProse } from "@animations/components/AnimatedProse";
import { AnimatedText } from "@animations/components/AnimatedText";
import { ContactFormClient } from "@routes/components/ContactFormClient";
import { SanityImage } from "@lib/sanity/components/SanityImage";
import { SanityLink } from "@lib/sanity/components/SanityLink";
import { getHeroSectionData } from "@lib/sanity/queries/contactPage/HeroSectionData";

const SECTION_CLASS_NAME = "pt-0 pb-0 bg-background";
const HERO_THEME = "light";

export default async function HeroSection() {
  const data = await getHeroSectionData();

  if (!data) return null;

  return (
    <section
      data-theme={HERO_THEME}
      data-page-builder-section={true}
      className={SECTION_CLASS_NAME}
    >
      <div className="grid-container flex items-center py-header lg:min-h-svh">
        <div className="grid-layout !gap-y-64 items-center lg:min-h-750">
          <div className="grid-span-12 lg:grid-span-4 order-3 h-full lg:order-none">
            <div className="size-full overflow-hidden">
              {data.asciiImage && (
                <SanityImage
                  image={data.asciiImage}
                  aspectRatio={0.6666666666666666}
                  className="size-full object-cover"
                />
              )}
            </div>
          </div>

          <div className="grid-span-12 lg:grid-span-2 lg:grid-start-6 flex h-full flex-col justify-between">
            <div>
              <AnimatedHeadline as="h2" trigger="scroll">
                {data.headline}
              </AnimatedHeadline>
            </div>

            <div className="prose prose-sm mt-auto text-body-sm text-foreground/60">
              <AnimatedProse className="flex flex-col gap-16">
                {data.contactInformation?.email && (
                  <div className="text-body empty:hidden" data-paragraph>
                    <AnimatedText>
                      Email:{" "}
                      <SanityLink
                        link={{ href: `mailto:${data.contactInformation.email}`, text: data.contactInformation.email }}
                        className="group relative no-underline outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {data.contactInformation.email}
                        <span className="pointer-events-none absolute inset-x-0 -bottom-1" aria-hidden="true">
                          <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-100 bg-current transition-transform delay-300 duration-700 [transition-timing-function:cubic-bezier(0.625,0.05,0,1)] group-hover:origin-right group-hover:scale-x-0 group-hover:delay-0 group-focus-visible:origin-right group-focus-visible:scale-x-0 group-focus-visible:delay-0" />
                          <span className="absolute inset-x-0 top-0 h-px origin-right scale-x-0 bg-current transition-transform delay-0 duration-700 [transition-timing-function:cubic-bezier(0.625,0.05,0,1)] group-hover:origin-left group-hover:scale-x-100 group-hover:delay-300 group-focus-visible:origin-left group-focus-visible:scale-x-100 group-focus-visible:delay-300" />
                        </span>
                      </SanityLink>
                    </AnimatedText>
                  </div>
                )}

                {data.team?.map((person) => (
                  <Fragment key={person._key}>
                    <br />
                    {person.label}:{" "}
                    <SanityLink
                      link={{ href: `mailto:${person.email}`, text: person.email, type: "email" }}
                      className="group relative no-underline outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {person.email}
                      <span className="pointer-events-none absolute inset-x-0 -bottom-1" aria-hidden="true">
                        <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-100 bg-current transition-transform delay-300 duration-700 [transition-timing-function:cubic-bezier(0.625,0.05,0,1)] group-hover:origin-right group-hover:scale-x-0 group-hover:delay-0 group-focus-visible:origin-right group-focus-visible:scale-x-0 group-focus-visible:delay-0" />
                        <span className="absolute inset-x-0 top-0 h-px origin-right scale-x-0 bg-current transition-transform delay-0 duration-700 [transition-timing-function:cubic-bezier(0.625,0.05,0,1)] group-hover:origin-left group-hover:scale-x-100 group-hover:delay-300 group-focus-visible:origin-left group-focus-visible:scale-x-100 group-focus-visible:delay-300" />
                      </span>
                    </SanityLink>
                  </Fragment>
                ))}

                {data.socialLinks?.length > 0 && (
                  <>
                    <br />
                    <br />
                    {data.socialLinks.map((link, index) => (
                      <SanityLink
                        key={link.href ?? index}
                        link={link}
                        className="text-body underline underline-offset-4 hover:no-underline"
                      >
                        {link.text}
                      </SanityLink>
                    ))}
                  </>
                )}

                {data.availability?.isAvailable && data.availability?.text && (
                  <div className="text-body empty:hidden" data-paragraph>
                    <AnimatedText>{data.availability.text}</AnimatedText>
                  </div>
                )}
              </AnimatedProse>
            </div>
          </div>

          <div className="grid-span-12 lg:grid-span-5 lg:grid-start-9 flex h-full flex-col justify-between">
            <div className="mb-48">
              {data.bookCallHeading && (
                <h3 className="mb-24 text-h4">{data.bookCallHeading}</h3>
              )}
              {data.bookCallCta?.link && (
                <SanityLink
                  link={data.bookCallCta.link}
                  animated
                  theme={data.bookCallCta.theme ?? "brand"}
                >
                  {data.bookCallCta.link.text}
                </SanityLink>
              )}
            </div>

            <div>
              {data.formHeading && (
                <h3 className="mb-32 text-h4">{data.formHeading}</h3>
              )}
              <ContactFormClient />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
