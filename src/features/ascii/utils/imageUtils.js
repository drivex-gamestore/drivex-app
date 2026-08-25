export function resolveImageSrc(url) {
  return url.startsWith("https://cdn.sanity.io/")
    ? `/api/image-proxy?url=${encodeURIComponent(url)}`
    : url;
}
export function onTextureLoadError(error) {
  console.error("Failed to load texture:", error);
}
