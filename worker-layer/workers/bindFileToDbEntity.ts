import path from "node:path";

import { Movie, Episode } from "@prisma/client";
import { Worker } from "bullmq";

import { redisConfig } from "#/redisConfig";
import { makeServersidePostDataLayer } from "#/axiosTransporter";
import { applyInfoColor, applyFailureColor } from "#/utils/workerLayerLogs";
import { cleanupFileName } from "#/processEntityHelper/cleanupFileName";
import { saveFileAndConnectToEntity } from "#/processEntityHelper/saveFileAndConnectToEntity";
import { fromSearchDataSelectBestMatch } from "#/processEntityHelper/fromSearchDataSelectBestMatch";
import { fromBestMatchFillDb } from "#/processEntityHelper/fromBestMatchFillDb";
import { getSeasonAndEpisodeNumberFromFilePath } from "#/processEntityHelper/getSeasonAndEpisodeNumberFromFilePath";

export type BindFileToDbEntityReturn = void;
export type BindFileToDbEntityData = {
  sourcePath: string;
  filePath: string;
  potencialSubtitleTrack: string[];
};
export type BindFileToDbEntityQueueName = "bindFileToDbEntity";

async function bindFileToDbEntity({
  sourcePath,
  filePath,
  potencialSubtitleTrack,
}: BindFileToDbEntityData) {
  const fileBaseName = path.basename(filePath);
  const magicRegex =
    /^(.+?)[.( \t]*(?:(?:(19\d{2}|20(?:0\d|1[0-9]))).*|(?:(?=bluray|\d+p|brrip|WEBRip)..*)?[.](mkv|avi|mpe?g|mp4)$)/gim;

  const regexReturn = magicRegex.exec(fileBaseName);
  if (!regexReturn) return;
  const [, movieTitle] = regexReturn;
  const cleanTitleName = cleanupFileName(movieTitle);
  const fileIsProbablyPartOfSerie = new RegExp(
    /S(?<seasonNumber>[0-9]).E(?<episodeNumber>[0-9])/
  ).test(fileBaseName);

  try {
    console.log(applyInfoColor(`Looking for ${cleanTitleName}`));
    const { data } = await makeServersidePostDataLayer("/searchV2", {
      query: cleanTitleName,
      type: fileIsProbablyPartOfSerie ? "series" : "movie",
    });
    const mostProbableChoice = fromSearchDataSelectBestMatch(
      data,
      cleanTitleName
    );

    if (!mostProbableChoice) throw new Error("No result found for this entry");
    if (mostProbableChoice.id.includes("movie")) {
      console.log(
        applyInfoColor(` | Found movie search match ${mostProbableChoice.name}`)
      );
      const movie = await fromBestMatchFillDb<"movie">({
        entityId: mostProbableChoice.id as `movie-${number}`,
        episodeInfo: undefined,
      });

      console.log(
        applyInfoColor(` | Found movie data match with name ${movie.name}`)
      );
      const { id } = await saveFileAndConnectToEntity(
        sourcePath,
        filePath,
        "movie",
        movie as Movie,
        potencialSubtitleTrack
      );
      return;
    } else if (mostProbableChoice.id.includes("serie")) {
      const episodeInfo = getSeasonAndEpisodeNumberFromFilePath(fileBaseName);
      console.log(
        applyInfoColor(
          ` | Found episode search match ${mostProbableChoice.name} S${episodeInfo.seasonNumber}E${episodeInfo.episodeNumber}`
        )
      );
      const episode = await fromBestMatchFillDb<"serie">({
        entityId: mostProbableChoice.id as `serie-${number}`,
        episodeInfo: episodeInfo,
      });

      console.log(
        applyInfoColor(` | Found episode data match with name ${episode.name}`)
      );
      await saveFileAndConnectToEntity(
        sourcePath,
        filePath,
        "episode",
        episode as Episode,
        potencialSubtitleTrack
      );
      return;
    } else throw new Error("Unvalid entity type");
  } catch (err) {
    console.info(applyFailureColor(` | Failed for ${filePath}`));
    return;
  }
}

new Worker<
  BindFileToDbEntityData,
  BindFileToDbEntityReturn,
  BindFileToDbEntityQueueName
>(
  "bindFileToDbEntity",
  async ({ data }) => {
    console.log(`Processing single file ${data.filePath}`);
    await bindFileToDbEntity(data);
  },
  redisConfig
);
