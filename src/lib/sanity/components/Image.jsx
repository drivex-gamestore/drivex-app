
import React from "react";
import { preload } from "react-dom";
import { parseResponsiveValues } from '@lib/sanity/utils/responsive';// derived path for 601247

export function createResponsiveSizes(sizesStr) {
  const defaultSize = "100vw";
  const parsed = parseResponsiveValues(sizesStr);
  const entries = Object.entries(parsed);
  
  let defaultVal = defaultSize;
  const mapped = entries.map(([key, { value, resolvedWidth }]) => {
    if (key === "DEFAULT") {
      defaultVal = value;
      return null;
    }
    return `(min-width: ${resolvedWidth}) ${value}`;
  }).filter(Boolean);
  
  if (mapped.length) {
    return `${mapped.join(", ")}, ${defaultVal}`;
  }
  return defaultVal;
}

export function Image({
  sizes,
  src,
  srcSet,
  priority,
  alt = "",
  loading = priority ? "eager" : "lazy",
  decoding = loading === "lazy" ? "async" : "auto",
  ...rest
}) {
  if (priority) {
    preload(src, {
      as: "image",
      fetchPriority: "high",
      imageSrcSet: srcSet,
      imageSizes: sizes ? createResponsiveSizes(sizes) : undefined,
    });
  }

  return (
    <img
      loading={loading}
      fetchPriority={priority ? "high" : undefined}
      decoding={decoding}
      alt={alt}
      src={src}
      srcSet={srcSet}
      sizes={sizes ? createResponsiveSizes(sizes) : undefined}
      {...rest}
    />
  );
}

