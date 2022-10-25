import type { BindFileToDbEntityData } from "#/workers/bindFileToDbEntity";
import { makeServersidePostDataLayer } from "#/axiosTransporter";
import { cleanupFileName } from "#/processEntityHelper/cleanupFileName";
import { fromSearchDataSelectBestMatch } from "#/processEntityHelper/fromSearchDataSelectBestMatch";
import { applyInfoColor } from "#/utils/workerLayerLogs";
import type { SearchResult } from "@prisma/client";

export async function fuzzySearchPatternMatching(
  { sourcePath, filePath, potencialSubtitleTrack }: BindFileToDbEntityData,
  fileBaseName: string
): Promise<SearchResult> {
  const magicRegex =
    /^(.+?)[.( \t]*(?:(?:(19\d{2}|20(?:0\d|1[0-9]))).*|(?:(?=bluray|\d+p|brrip|WEBRip)..*)?[.](mkv|avi|mpe?g|mp4)$)/gim;

  const regexReturn = magicRegex.exec(fileBaseName);
  if (!regexReturn) throw new Error("No regex match in fuzzy search");
  const [, movieTitle] = regexReturn;
  const cleanTitleName = cleanupFileName(movieTitle);
  const fileIsProbablyPartOfSerie = new RegExp(
    /S(?<seasonNumber>[0-9]).E(?<episodeNumber>[0-9])/
  ).test(fileBaseName);

  console.log(applyInfoColor(`Looking for ${cleanTitleName}`));
  const { data } = await makeServersidePostDataLayer("/searchTvDbFuzzy", {
    query: cleanTitleName,
    type: fileIsProbablyPartOfSerie ? "series" : "movie",
  });
  const mostProbableChoice = fromSearchDataSelectBestMatch(
    data,
    cleanTitleName
  );

  if (!mostProbableChoice) throw new Error("No result found for this entry");
  return mostProbableChoice;
}
