export function removePictureCropDirectiveFromUrl(
  pictureUrl: string | unknown | null
) {
  if (!pictureUrl) return null;
  if (typeof pictureUrl !== "string") return null;
  if (!pictureUrl.includes("._V1_")) return pictureUrl;

  return pictureUrl.replace(/(.*._V1)(.*)(\..*)/gi, "$1$3");
}
