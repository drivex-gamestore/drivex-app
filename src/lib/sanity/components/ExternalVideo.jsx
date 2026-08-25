"use client";


import React, { useRef, useState, useEffect } from "react";
import { cx } from '@lib/vendor';

import { createResponsiveRatios } from '@lib/sanity/utils/responsive';

export function ExternalVideo(props) {
  const {
    src,
    aspectRatio,
    width,
    height,
    style,
    className,
    loop,
    autoPlay,
    muted,
    controls,
    objectFit = "cover",
    objectPosition = "center",
    ...rest
  } = props;

  const showControls = controls !== undefined && controls;

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    return observer.observe(containerRef.current), () => observer.disconnect();
  }, []);

  if (!src) return null;

  const ratio = aspectRatio ?? 1.7777777777777777;
  const responsiveRatios = createResponsiveRatios(ratio);

  const containerStyle = {
    ...responsiveRatios.styles,
    "--desired-width": height ? "auto" : width ? `${width}px` : "auto",
    "--desired-height": height ? `${height}px` : "auto",
    ...style,
  };

  const containerClassName = cx(
    "relative isolate h-(--desired-height,auto) w-(--desired-width,auto) max-w-full overflow-hidden",
    responsiveRatios.className,
    className
  );

  return (
    <div ref={containerRef} style={containerStyle} className={containerClassName}>
      {isIntersecting && (
        <video
          ref={videoRef}
          {...rest}
          src={src}
          loop={loop !== false}
          muted={muted !== false}
          autoPlay={autoPlay !== false}
          controls={showControls === true}
          playsInline={true}
          preload="auto"
          className="absolute inset-0 size-full"
          style={{ objectFit, objectPosition }}
        />
      )}
    </div>
  );
}
