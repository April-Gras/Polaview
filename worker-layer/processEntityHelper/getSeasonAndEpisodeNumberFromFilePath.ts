export function getSeasonAndEpisodeNumberFromFilePath(filePath: string): {
  episodeNumber: number;
  seasonNumber: number;
} {
  const matches = /S(?<seasonNumber>\d{1,2})E(?<episodeNumber>\d{1,2})/gi.exec(
    filePath
  );

  if (
    !matches ||
    !matches.groups ||
    !matches.groups.seasonNumber ||
    !matches.groups.episodeNumber
  )
    throw "no matches for episode or season in file path";

  const episodeNumber = Number(matches.groups.episodeNumber);
  const seasonNumber = Number(matches.groups.seasonNumber);

  if (isNaN(episodeNumber) || isNaN(seasonNumber))
    throw "either episode or season is not a number";

  return { seasonNumber, episodeNumber };
}
