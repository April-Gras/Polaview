import fs from "node:fs";

export function findMatchingSubTracks(wellFormatedFilePath: string) {
  const targetExtentions = [".srt"];

  return targetExtentions.reduce((accumulator, targetExtention) => {
    const potencialSubtitleTrack = wellFormatedFilePath.replace(
      /\.mp4/,
      targetExtention
    );

    if (fs.existsSync(potencialSubtitleTrack))
      accumulator.push(potencialSubtitleTrack);
    return accumulator;
  }, [] as string[]);
}
