import { AnimatedButton } from "@animations/components/AnimatedButton"; 
import { AnimatedLink } from '@animations/components/AnimatedLink';
import { SanityLink } from "@lib/sanity/components/SanityLink"; 

export function SanityButton({ button, className }) {
  if (!button.link?.href) return null;

  if (button.variant === "link") {
    const isExternal = button.link.type === "external";
    return (
      <AnimatedLink asChild={true} indicator={isExternal} className={className}>
        <SanityLink link={button.link}>{button.link.text}</SanityLink>
      </AnimatedLink>
    );
  }

  return (
    <AnimatedButton
      size={button.size}
      theme={button.theme}
      asChild={true}
      className={className}
    >
      <SanityLink link={button.link}>{button.link.text}</SanityLink>
    </AnimatedButton>
  );
}
