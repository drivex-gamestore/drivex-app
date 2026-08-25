// Not a registered schema type. Returns a flat array of fields whose
// names match the exact query paths in HeroSectionData.js / FooterData.js
// (e.g. "asciiImage" / "asciiImageLeft"), so existing GROQ queries keep working.
export function asciiArtFields(suffix = "") {
  return [
    { name: `asciiImage${suffix}`, title: `ASCII image${suffix ? ` (${suffix})` : ""}`, type: "customImage" },
    { name: `asciiDepthMap${suffix}`, title: `ASCII depth map${suffix ? ` (${suffix})` : ""}`, type: "customImage" },
    { name: `asciiColor${suffix}`, title: `ASCII color${suffix ? ` (${suffix})` : ""}`, type: "string" },
    { name: `asciiColorDark${suffix}`, title: `ASCII color (dark)${suffix ? ` (${suffix})` : ""}`, type: "string" },
    { name: `asciiCellSize${suffix}`, title: `ASCII cell size${suffix ? ` (${suffix})` : ""}`, type: "number" },
    { name: `asciiParallaxIntensity${suffix}`, title: `ASCII parallax intensity${suffix ? ` (${suffix})` : ""}`, type: "number" },
    { name: `asciiRevealOriginX${suffix}`, title: `ASCII reveal origin X${suffix ? ` (${suffix})` : ""}`, type: "number" },
    { name: `asciiRevealOriginY${suffix}`, title: `ASCII reveal origin Y${suffix ? ` (${suffix})` : ""}`, type: "number" },
    { name: `asciiMobileFallback${suffix}`, title: `ASCII mobile fallback${suffix ? ` (${suffix})` : ""}`, type: "customImage" },
  ];
}
