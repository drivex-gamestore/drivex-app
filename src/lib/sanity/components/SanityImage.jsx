"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { cx } from '@lib/vendor';
import { Image, createResponsiveSizes } from '@lib/sanity/components/Image';
import { parseAspectRatio, parseResponsiveValues } from '@lib/sanity/utils/responsive';
import { run } from '@lib/sanity/utils/run';
import { getImageDimensions, getImageSrc, getImageSrcSet, getLqipBackgroundStyle } from '@lib/sanity/utils/sanity-imageutils';

const loadedImageSet = new Set();

export function SanityImage({
  image,
  aspectRatio,
  builderOptions,
  style,
  alt,
  sizes,
  onLoad,
  width,
  height,
  noPlaceholder,
  priority,
  className,
  ref: externalRef,
  ...rest
}) {
  const useImageLoading = (imageId, isPriority) => {
    const isAlreadyLoaded = !!imageId && loadedImageSet.has(imageId);
    const [hasStartedLoading, setHasStartedLoading] = useState(isAlreadyLoaded);
    const [isVisible, setIsVisible] = useState(isPriority || isAlreadyLoaded);
    const imgRef = useRef(null);

    const handleLoad = useCallback(() => {
      setHasStartedLoading(true);
    }, []);

    useEffect(() => {
      if (imgRef.current?.complete) {
        handleLoad();
      }
    }, [handleLoad]);

    useEffect(() => {
      if (isPriority) return;
      const element = imgRef.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry?.isIntersecting) {
            setIsVisible(true);
            if (imageId) loadedImageSet.add(imageId);
            observer.disconnect();
          }
        },
        { rootMargin: "0px 0px -100px 0px" }
      );
      observer.observe(element);
      return () => observer.disconnect();
    }, [isPriority, imageId]);

    const isVisibleAndLoaded = hasStartedLoading && isVisible;

    return {
      ref: imgRef,
      visible: isVisibleAndLoaded,
      onLoad: handleLoad
    };
  };

  const imageId = image?._id ?? undefined;
  const loadingState = useImageLoading(imageId, priority);
  const combinedRef = composeRefs(loadingState.ref, externalRef);

  const handleImageLoad = useCallback(
    (e) => {
      loadingState.onLoad();
      onLoad?.(e);
    },
    [loadingState.onLoad, onLoad]
  );

  if (!imageId) return null;

  const responsiveSources = run(() => {
    if (aspectRatio) {
      return Object.entries(parseResponsiveValues(String(aspectRatio)))
        .map(([bp, { value, resolvedWidth }]) => {
          if (!resolvedWidth) return null;
          const opts = {
            width: width ? Number(width) : undefined,
            height: height ? Number(height) : undefined,
            aspectRatio: value ? parseAspectRatio(value) : undefined,
            ...builderOptions
          };
          const dims = getImageDimensions(image, opts);
          return {
            bp,
            srcSet: getImageSrcSet(image, opts),
            sizes: sizes ? createResponsiveSizes(sizes) : undefined,
            width: dims.width,
            height: dims.height,
            media: `(min-width: ${resolvedWidth})`
          };
        })
        .filter((src) => !!src);
    }
  });

  const parsedDefaultAspectRatio = run(() => {
    if (aspectRatio) {
      const defaultVal = parseResponsiveValues(String(aspectRatio)).DEFAULT.value;
      return defaultVal ? parseAspectRatio(defaultVal) : undefined;
    }
  });

  const defaultOptions = {
    width: width ? Number(width) : undefined,
    height: height ? Number(height) : undefined,
    aspectRatio: parsedDefaultAspectRatio,
    ...builderOptions
  };

  const defaultDims = getImageDimensions(image, defaultOptions);
  const defaultSrc = getImageSrc(image, defaultOptions);
  const defaultSrcSet = getImageSrcSet(image, defaultOptions);

  const lqipStyle = loadingState.visible || noPlaceholder ? undefined : getLqipBackgroundStyle(image);
  const resolvedAlt = alt ?? image.altText ?? image.description ?? image.title ?? "";

  const containerStyle = {
    ...(width ? { "--desired-width": `${width}px` } : {}),
    ...(height ? { "--desired-height": `${height}px` } : {}),
    ...lqipStyle,
    ...style
  };

  return (
    <picture className={cx("relative flex items-center justify-center", className)}>
      {responsiveSources?.map(({ bp, ...sourceProps }) => (
        <source key={bp} {...sourceProps} />
      ))}
      <Image
        {...rest}
        priority={priority}
        ref={combinedRef}
        onLoad={handleImageLoad}
        src={defaultSrc}
        sizes={sizes}
        srcSet={defaultSrcSet}
        alt={resolvedAlt}
        width={defaultDims.width}
        height={defaultDims.height}
        style={containerStyle}
        className={cx(
          "h-(--desired-height,100%) w-(--desired-width,100%) max-w-full transition-opacity duration-700 ease-in-out",
          loadingState.visible ? "opacity-100" : "opacity-0"
        )}
      />
      <span
        className={cx(
          "pointer-events-none absolute inset-0 bg-brand/[0.06] transition-opacity duration-700 ease-in-out",
          loadingState.visible ? "opacity-0" : "opacity-100"
        )}
        aria-hidden="true"
      />
    </picture>
  );
}
// original module ID: 919848
