import path from "node:path";

import { Movie, Episode, SearchResult } from "@prisma/client";
import { Worker } from "bullmq";

import { redisConfig } from "#/redisConfig";
import { fuzzySearchPatternMatching } from "#/processEntityHelper/fuzzySearchPatternMatching";
import { remoteIdBasedPaternMatching } from "#/processEntityHelper/remoteIdBasedPaternMatching";
import { applyInfoColor, applyFailureColor } from "#/utils/workerLayerLogs";
import { saveFileAndConnectToEntity } from "#/processEntityHelper/saveFileAndConnectToEntity";
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
  try {
    const fileBaseName = path.basename(filePath);
    const remoteIdProbe = probeForEmbededRemoteId(fileBaseName);
    let foundResult: SearchResult;

    if (remoteIdProbe)
      foundResult = await remoteIdBasedPaternMatching(remoteIdProbe);
    else
      foundResult = await fuzzySearchPatternMatching(
        { sourcePath, filePath, potencialSubtitleTrack },
        fileBaseName
      );

    if (foundResult.id.includes("movie")) {
      console.log(
        applyInfoColor(` | Found movie search match ${foundResult.name}`)
      );
      const movie = await fromBestMatchFillDb<"movie">({
        entityId: foundResult.id as `movie-${number}`,
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
    } else if (foundResult.id.includes("serie")) {
      const episodeInfo = getSeasonAndEpisodeNumberFromFilePath(fileBaseName);
      console.log(
        applyInfoColor(
          ` | Found episode search match ${foundResult.name} S${episodeInfo.seasonNumber}E${episodeInfo.episodeNumber}`
        )
      );
      const episode = await fromBestMatchFillDb<"serie">({
        entityId: foundResult.id as `serie-${number}`,
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
    console.error(err);
    console.info(applyFailureColor(` | Failed for ${filePath}`));
    return;
  }
}

function probeForEmbededRemoteId(filePath: string): null | string {
  const regex = new RegExp(/ImdbId-(?<imdbId>.+)\.[\S\d]+/gi);
  const matches = regex.exec(filePath);

  if (!matches || !matches.groups || typeof matches.groups.imdbId !== "string")
    return null;
  return matches.groups.imdbId;
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
  { ...redisConfig, concurrency: 1 }
);
