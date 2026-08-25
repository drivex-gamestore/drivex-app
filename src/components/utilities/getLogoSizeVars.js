const LOGO_HEIGHTS = {
  horizontal: { mobile: 16, desktop: 20 },
  square: { mobile: 24, desktop: 32 },
  vertical: { mobile: 32, desktop: 48 },
};

function getLogoSizeVars(variant) {
  const { mobile, desktop } = LOGO_HEIGHTS[variant];
  return {
    "--logo-h": `${mobile}px`,
    "--logo-h-desktop": `${desktop}px`,
  };
}

export{
  LOGO_HEIGHTS,
  getLogoSizeVars
 };
