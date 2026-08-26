"use client";

import React from "react";
import { Link } from "@shared/constants/navigation";
import { cva, cx } from '@lib/vendor';
import { useModal } from '@shared/hooks/useModal';

const icons = {
  "arrow-right": (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" viewBox="0 0 20 20" {...props}>
      <path fill="#232626" d="M2.651 9.615h-.5v1h.5v-1m14.445 1a.5.5 0 1 0 0-1v1M12.04 4.559v-.5h-1v.5h1m4.76 5.94a.5.5 0 0 0 .48-.879l-.24.44zm-5.76 5.116v.5h1v-.5h-1m-8.389-5.5v.5H17.04v-1H2.65zm14.389 0v.5h.056v-1h-.056zm-5.5-5.556h-.5c0 .8.432 1.568.972 2.23.55.675 1.27 1.31 1.972 1.853a23.5 23.5 0 0 0 2.75 1.819l.048.027.013.007.004.002h.001l.24-.438.24-.439h-.001l-.003-.001-.01-.006-.043-.024-.17-.097a22.497 22.497 0 0 1-2.458-1.641c-.672-.52-1.326-1.102-1.808-1.693-.492-.604-.747-1.147-.747-1.599zm5.5 5.556-.19-.463-.004.002-.063.026-.184.08c-.156.07-.378.173-.643.307-.53.267-1.24.659-1.953 1.16-.711.498-1.442 1.117-2 1.84-.558.725-.963 1.583-.963 2.548h1c0-.675.282-1.323.755-1.937s1.118-1.167 1.782-1.633a15 15 0 0 1 2.638-1.462l.01-.004h.002z" />
    </svg>
  ),
  "arrow-left": (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" viewBox="0 0 20 20" {...props}>
      <path fill="#232626" d="M17.096 10.56h.5v-1h-.5v1m-14.445-1a.5.5 0 1 0 0 1v-1m5.056 6.055v.5h1v-.5h-1m-4.76-5.939a.5.5 0 0 0-.48.878l.24-.439zm5.76-5.117v-.5h-1v.5h1m8.389 5.5v-.5H2.707v1h14.389zm-14.389 0v-.5h-.056v1h.056zm5.5 5.556h.5c0-.799-.432-1.568-.972-2.23-.55-.675-1.27-1.31-1.972-1.853a23.5 23.5 0 0 0-2.811-1.853l-.004-.002h-.001l-.24.438-.24.439h.001l.002.001.01.006.213.12a22.469 22.469 0 0 1 2.458 1.641c.673.52 1.327 1.104 1.809 1.695.491.603.747 1.146.747 1.598zm-5.5-5.556.188.463h.001l.004-.002.014-.005.05-.021.183-.08a15.877 15.877 0 0 0 2.597-1.466c.71-.5 1.442-1.118 2-1.841.558-.725.963-1.583.963-2.548h-1c0 .675-.283 1.323-.756 1.937S5.834 7.663 5.17 8.13a15 15 0 0 1-2.638 1.462l-.01.004H2.52z" />
    </svg>
  ),
  "arrow-up": (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" viewBox="0 0 20 20" {...props}>
      <path fill="#232626" d="M9.401 17.31v.5h1v-.5h-1m1-14.445a.5.5 0 0 0-1 0h1M4.346 7.92h-.5v1h.5v-1m5.938-4.76a.5.5 0 0 0-.878-.479l.44.24zm5.117 5.76h.5v-1h-.5v1m-5.5 8.39h.5V2.92h-1v14.39zm0-14.39h.5v-.055h-1v.056zm-5.555 5.5v.5c.798 0 1.567-.432 2.23-.971.674-.55 1.31-1.27 1.853-1.973a23.5 23.5 0 0 0 1.845-2.798l.008-.013.002-.003V3.16l-.439-.24-.438-.24-.008.014-.12.212a22.488 22.488 0 0 1-1.641 2.458c-.52.673-1.103 1.327-1.694 1.808-.603.492-1.147.747-1.598.747zM9.9 2.92l-.463.188v.002l.002.004.027.064.08.183a15.88 15.88 0 0 0 1.466 2.597c.499.71 1.117 1.442 1.84 2 .725.557 1.583.962 2.548.962v-1c-.674 0-1.323-.282-1.937-.755s-1.166-1.117-1.633-1.782a15 15 0 0 1-1.461-2.638l-.004-.01-.001-.002z" />
    </svg>
  ),
  "arrow-down": (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" viewBox="0 0 20 20" {...props}>
      <path fill="#232626" d="M10.345 2.865v-.5h-1v.5h1m-1 14.444a.5.5 0 0 0 1 0h-1m6.056-5.055h.5v-1h-.5v1m-5.939 4.76a.5.5 0 0 0 .878.479l-.439-.24zm-5.116-5.76h-.5v1h.5v-1m5.5-8.39h-.5v14.39h1V2.863zm0 14.39h-.5v.055h1v-.056zm5.555-5.5v-.5c-.799 0-1.567.432-2.23.971-.675.55-1.31 1.27-1.853 1.973a23.5 23.5 0 0 0-1.846 2.798l-.007.013-.002.003v.001l.438.24.44.24v-.003l.007-.01a6 6 0 0 1 .12-.213 22.474 22.474 0 0 1 1.641-2.458c.52-.673 1.103-1.327 1.694-1.808.603-.492 1.147-.747 1.598-.747zm-5.556 5.5.464-.188v-.002l-.002-.004-.027-.063-.08-.184a15.878 15.878 0 0 0-1.466-2.597c-.499-.71-1.117-1.442-1.841-2-.724-.557-1.583-.962-2.547-.962v1c.674 0 1.323.282 1.937.755s1.166 1.117 1.632 1.782a15 15 0 0 1 1.462 2.638l.004.01v.002z" />
    </svg>
  ),
  "arrow-up-right": (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" viewBox="0 0 20 20" {...props}>
      <path fill="#232626" d="m4.433 14.86-.354.354.707.707.354-.354-.354-.353zm10.92-9.507a.5.5 0 1 0-.707-.707L15 5zm-7.856-.707-.354-.353L6.436 5l.354.353L7.143 5zm7.565.834a.5.5 0 0 0-.282-.96l.141.48zm-.455 7.69.354.354.707-.707-.354-.353-.354.353zm-9.82 2.044.353.353L15.314 5.393l-.354-.354-.353-.353L4.433 14.86zM14.96 5.039l.353.354.04-.04L15 5l-.354-.354-.039.04zM7.143 5l-.353.354c.565.565 1.414.803 2.264.89.865.088 1.825.029 2.705-.084a23.5 23.5 0 0 0 3.283-.674l.014-.004h.004l.002-.001-.14-.48-.142-.48-.003.001-.06.017q-.064.019-.187.051a22.49 22.49 0 0 1-2.899.577c-.843.109-1.718.16-2.476.082-.774-.079-1.339-.283-1.658-.602zm7.818.04-.46-.195H14.5v.002l-.002.004-.026.064-.073.186a15.877 15.877 0 0 0-.8 2.873c-.15.855-.23 1.81-.112 2.715.118.907.438 1.8 1.12 2.483l.354-.354.353-.353c-.477-.477-.736-1.135-.835-1.904-.1-.77-.035-1.615.105-2.415a15 15 0 0 1 .832-2.898l.004-.01v-.002z" />
    </svg>
  )
};

function IconBase({ name, className, ...rest }) {
  const IconComponent = icons[name];
  if (!IconComponent) return null;
  return <IconComponent aria-hidden={true} className={cx("size-[1em] shrink-0", className)} {...rest} />;
}

const leftIconVariants = cva(
  ["flex items-center justify-center", "transition-transform duration-700 [transition-timing-function:var(--ease-power4-in-out)]"],
  {
    variants: {
      size: { sm: "size-40", default: "size-48", lg: "size-56" },
      position: {
        left: "origin-left -rotate-45 scale-0",
        right: "absolute right-0 z-10 origin-right rotate-0 scale-100"
      },
      theme: {
        light: "bg-foreground text-background",
        dark: "bg-foreground text-background",
        brand: "bg-brand text-black"
      }
    },
    defaultVariants: { size: "default", theme: "light" }
  }
);

const wrapperVariants = cva(
  ["flex w-full flex-1 items-center justify-center", "transition-transform duration-700 [transition-timing-function:var(--ease-power4-in-out)]"],
  {
    variants: {
      size: {
        sm: "h-40 -translate-x-[calc(40px+6px)] px-12",
        default: "h-48 -translate-x-[calc(48px+6px)] px-16",
        lg: "h-56 -translate-x-[calc(56px+6px)] px-24"
      },
      theme: {
        light: "bg-foreground text-background",
        dark: "bg-foreground text-background",
        brand: "bg-brand text-black"
      }
    },
    defaultVariants: { size: "default", theme: "light" }
  }
);

function ButtonIconWrapper({ className }) {
  return (
    <svg className={cx("size-[0.75em]", className)} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

export function SanityLink(props) {
  const { link, children, animated, size = "default", theme = "light", ...rest } = props;
  const { isOpen, modalId, openModal } = useModal();
  
  const content = children ?? link.text;
  const isModalActive = isOpen && modalId === link.modalId;

  if (link.type === "modal" && link.modalId) {
    const handleOpenModal = () => openModal(link.modalId);
    
    if (animated) {
      const buttonClassName = cx(
        "group inline-flex min-w-0 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap",
        "font-medium font-mono uppercase",
        "outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        size === "sm" && "text-body-sm",
        size === "default" && "text-body",
        size === "lg" && "text-body-lg",
        rest.className
      );

      const leftIconClass = cx(
        leftIconVariants({ size, theme, position: "left" }),
        "group-hover:rotate-0 group-hover:scale-100",
        isModalActive && "rotate-0 scale-100"
      );

      const textWrapperClass = cx(
        wrapperVariants({ size, theme }),
        "group-hover:translate-x-0",
        isModalActive && "translate-x-0"
      );

      const rightIconClass = cx(
        leftIconVariants({ size, theme, position: "right" }),
        "group-hover:-rotate-45 group-hover:scale-0",
        isModalActive && "-rotate-45 scale-0"
      );

      return (
        <button type="button" onClick={handleOpenModal} className={buttonClassName} {...rest}>
          <span className="relative flex w-full items-center gap-6">
            <span className={leftIconClass}>
              <ButtonIconWrapper />
            </span>
            <span className={textWrapperClass}>{content}</span>
            <span className={rightIconClass}>
              <ButtonIconWrapper />
            </span>
          </span>
        </button>
      );
    }

    return (
      <button type="button" onClick={handleOpenModal} {...rest}>
        {content}
      </button>
    );
  }

  const target = link.openInNewTab ? "_blank" : undefined;
  const rel = link.openInNewTab ? "noopener noreferrer" : undefined;
  const download = link.canDownload ? "" : undefined;

  return (
    <Link href={link.href} target={target} rel={rel} download={download} {...rest}>
      {content}
    </Link>
  );
}

export function SanityLinkIcon(props) {
  const { link, ...rest } = props;
  if (link.openInNewTab) {
    return <IconBase name="arrow-up-right" {...rest} />;
  }
  if (link.canDownload) {
    return <IconBase name="arrow-down" {...rest} />;
  }
  return <IconBase name="arrow-right" {...rest} />;
}