export function thumbnailifyTvDbImage(image: string) {
  if (image.includes("/missing/")) return image;
  return image.split(".jpg").join("_t.jpg");
}
