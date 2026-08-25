"use client";

import { resolveImageSrc } from "@features/ascii/utils/imageUtils";


export async function computeContentBounds(
  imageSrc,
  origin = { x: 0.5, y: 0.5 }
) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          console.warn(
            "[ASCII] Could not get canvas context, using default bounds"
          );
          resolve(1);
          return;
        }

        const scale = Math.min(200 / img.width, 200 / img.height, 1);
        const w = Math.floor(img.width * scale);
        const h = Math.floor(img.height * scale);
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const data = ctx.getImageData(0, 0, w, h).data;
        const ox = origin.x * w;
        const oy = (1 - origin.y) * h;

        const maxCornerDist = Math.max(
          Math.hypot(ox, oy),
          Math.hypot(w - ox, oy),
          Math.hypot(ox, h - oy),
          Math.hypot(w - ox, h - oy)
        );

        let maxContentDist = 0;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            if (
              a !== undefined &&
              r !== undefined &&
              g !== undefined &&
              b !== undefined &&
              a > 10 &&
              (r > 15 || g > 15 || b > 15)
            ) {
              const dist = Math.hypot(x - ox, y - oy);
              maxContentDist = Math.max(maxContentDist, dist);
            }
          }
        }

        const normalised = Math.min((maxContentDist / maxCornerDist) * 1.05, 1);
        resolve(normalised);
      } catch (err) {
        console.warn("[ASCII] Error computing content bounds:", err);
        resolve(1);
      }
    };
    img.onerror = () => {
      console.warn("[ASCII] Could not load image for bounds computation");
      resolve(1);
    };
    img.src = resolveImageSrc(imageSrc);
  });
}
