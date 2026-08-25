import { createImageUrlBuilder } from "@sanity/image-url";
import { env } from 'env';
import {
  DEFAULT_MAX_WIDTH,
  DEFAULT_MAX_HEIGHT,
  DEFAULT_SOURCE_WIDTHS,
} from '@shared/constants/constants';
import { run } from '@lib/sanity/utils/run';


const builder = createImageUrlBuilder({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET
});

const defaultImageOptions = { auto: "format", quality: 90 };

export function getLqipBackgroundStyle({ lqip }) {
  return lqip ? { backgroundImage: `url(${lqip})`, backgroundSize: "cover" } : null;
}

export function getImageDimensions(image, options = {}) {
  const { width, height, aspectRatio, maxWidth, maxHeight } = options;

  const calculateCropDimensions = (img, opts = {}) => {
    const { crop } = opts;
    const { width: r, height: n } = img.dimensions || {};
    if (!r || !n) return { width: undefined, height: undefined };
    if (!crop) return { width: r, height: n };

    const { left = 0, top = 0, right = 0, bottom = 0 } = crop;
    const croppedWidth = r - left * r - right * r;
    const croppedHeight = n - top * n - bottom * n;

    return {
      width: croppedWidth > 0 ? croppedWidth : r,
      height: croppedHeight > 0 ? croppedHeight : n,
    };
  };

const getAspectRatio = (img, opts = {}) => {
  if (!img?.dimensions) return undefined; 
  const dims = calculateCropDimensions(img, opts);
  return dims.width && dims.height ? dims.width / dims.height : undefined;
};


  const calculateTarget = (img, opts = {}) => {
    const { crop, aspectRatio: optRatio, height: n, width: l } = opts;
    const derivedRatio = getAspectRatio(img, { crop });
    const fallbackWidth = img.dimensions?.width ?? Infinity;

    const resolveDims = ({ width: t, height: i }, r, fallbackSize) => {
      if (t && i) return { width: t, height: i };
      if (t && !i) return r ? { width: t, height: Math.round(t / r) } : { width: t, height: t };
      if (i && !t) return r ? { width: Math.round(i * r), height: i } : { width: i, height: i };
      if (!fallbackSize) throw new Error("Unable to calculate dimensions. Provide a fallbackSize.");
      return resolveDims(fallbackSize, r);
    };

    return resolveDims(
      { width: l, height: n },
      optRatio ?? derivedRatio,
      { width: Math.min(DEFAULT_SOURCE_WIDTHS[DEFAULT_SOURCE_WIDTHS.length - 1], fallbackWidth) }
    );
  };

  const limitDimensions = (dims, limits = {}) => {
    const { maxWidth: limitW = DEFAULT_MAX_WIDTH, maxHeight: limitH = DEFAULT_MAX_HEIGHT } = limits;
    let targetW = dims.width;
    let targetH = dims.height;

    if (limitW && targetW > limitW) {
      const ratio = limitW / targetW;
      targetW = limitW;
      targetH = Math.round(targetH * ratio);
    }
    if (limitH && targetH > limitH) {
      const ratio = limitH / targetH;
      targetH = limitH;
      targetW = Math.round(targetW * ratio);
    }
    return { width: targetW, height: targetH };
  };

  const targetDims = calculateTarget(image, { width, height, aspectRatio, crop: image.crop });
  return limitDimensions(targetDims, { maxWidth, maxHeight });
}

export function getImageSrc(image, options = {}) {
  const { width, height, aspectRatio, ...rest } = options;
  const fitMode = run(() => {
    if (image?.crop) return "crop";
    if (options.fit) return options.fit;
    if ((width && height) || aspectRatio) return "crop";
    return undefined;
  });

  const dims = getImageDimensions(image, { width, height, aspectRatio });

  const buildUrl = (img, opts = {}) => {
    const imgObj = { ...img, _id: img._id ?? undefined };
    return builder.withOptions({ ...defaultImageOptions, ...opts }).image(imgObj).url();
  };

  return buildUrl(image, { ...rest, fit: fitMode, width: dims.width, height: dims.height });
}

export function getImageSrcSet(image, options = {}) {
  const { sourceWidths = DEFAULT_SOURCE_WIDTHS, ...rest } = options;
  const imgWidth = image.dimensions?.width;

  return run(() => {
    if (rest.width || rest.height || (imgWidth && imgWidth < sourceWidths[0])) {
      return [2, 3].map((dpr) => {
        const src = getImageSrc(image, { ...rest, dpr });
        return `${src} ${dpr}x`;
      });
    }

    const srcSetEntries = sourceWidths.map((w) => {
      if (imgWidth && imgWidth < w) return null;
      const src = getImageSrc(image, { ...rest, height: undefined, width: w });
      return `${src} ${w}w`;
    });

    if (imgWidth && !sourceWidths.includes(imgWidth)) {
      const nearestSmaller = sourceWidths.filter((w) => imgWidth >= w).at(-1);
      if (nearestSmaller && imgWidth > nearestSmaller) {
        const src = getImageSrc(image, { ...rest, height: undefined, width: imgWidth });
        srcSetEntries.push(`${src} ${imgWidth}w`);
      }
    }

    return srcSetEntries;
  }).filter(Boolean).join(", ");
}