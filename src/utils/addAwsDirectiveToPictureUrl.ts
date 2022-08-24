export function addAwsDirectivesToPictureUrl(
  pictureUrl: string,
  {
    quality,
    scale,
  }: {
    quality: number;
    scale: number;
  }
): string {
  return pictureUrl.split("._V1").join(`._V1_QL${quality}_UX${scale}_`);
}
