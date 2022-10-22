import path from "node:path";
import crypto from "node:crypto";
import {
  applyFailureColor,
  applySuccessColor,
  applyInfoColor,
} from "#/utils/dataLayerLog";

import { expose } from "threads";
import { PrismaClient, SearchResult, Movie, Episode } from "@prisma/client";

import { compareTwoStrings } from "string-similarity";

import { makeServersidePostDataLayer } from "#/axiosTransporter";
import { hash } from "argon2";

const prisma = new PrismaClient();

type ProcessSingleFileThreadWorkerReturn = void;
export type ProcessSingleFileThreadWorker = (
  sourcePath: string,
  filePath: string,
  wholePath: string,
  potencialSubtitleTrack: string[]
) => Promise<ProcessSingleFileThreadWorkerReturn>;

const processSingleFileThreadWorker: ProcessSingleFileThreadWorker =
  async function (sourcePath, filePath, wholePath, potencialSubtitleTrack) {
    const fileBaseName = path.basename(filePath);
    const magicRegex =
      /^(.+?)[.( \t]*(?:(?:(19\d{2}|20(?:0\d|1[0-9]))).*|(?:(?=bluray|\d+p|brrip|WEBRip)..*)?[.](mkv|avi|mpe?g|mp4)$)/gim;

    const regexReturn = magicRegex.exec(fileBaseName);
    if (!regexReturn) return;
    const [, movieTitle, releaseYear] = regexReturn;
    const cleanTitleName = cleanupTitleName(movieTitle);
    const fileIsProbablyPartOfSerie = new RegExp(
      /S(?<seasonNumber>[0-9]).E(?<episodeNumber>[0-9])/
    ).test(fileBaseName);

    try {
      console.log(applyInfoColor(`Looking for ${cleanTitleName}`));
      const { data } = await makeServersidePostDataLayer("/searchV2", {
        query: cleanTitleName,
        type: fileIsProbablyPartOfSerie ? "series" : "movie",
      });
      const mostProbableChoice = selectMostMatchingSearchData(
        data,
        cleanTitleName
      );

      if (!mostProbableChoice)
        throw new Error("No result found for this entry");
      if (mostProbableChoice.id.includes("movie")) {
        console.log(
          applyInfoColor(
            ` | Found movie search match ${mostProbableChoice.name}`
          )
        );
        const { data: movie } = await makeServersidePostDataLayer(
          "/processEntity",
          {
            entityId: mostProbableChoice.id as `movie-${number}`,
            episodeInfo: undefined,
          }
        );

        console.log(
          applyInfoColor(` | Found movie data match with name ${movie.name}`)
        );
        const { id } = await saveFileAndConnectToEntity(
          sourcePath,
          wholePath,
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
        const { data: episode } = await makeServersidePostDataLayer(
          "/processEntity",
          {
            entityId: mostProbableChoice.id as `serie-${number}`,
            episodeInfo,
          }
        );

        console.log(
          applyInfoColor(
            ` | Found episode data match with name ${episode.name}`
          )
        );
        const { id } = await saveFileAndConnectToEntity(
          sourcePath,
          wholePath,
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
  };

async function saveFileAndConnectToEntity<T extends "movie" | "episode">(
  sourcePath: string,
  filePath: string,
  type: T,
  targetEntity: T extends "movie" ? Movie : Episode,
  potencialSubtitleTrack: string[]
) {
  const hashFunction = crypto.createHash("sha256");
  const source = await prisma.fileSourceV2.upsert({
    where: {
      path: sourcePath,
    },
    create: {
      path: sourcePath,
    },
    update: {
      updatedOn: new Date(),
    },
  });
  // Hashing the filename to an id so we guaranty the id to be unique when threaded because prisma concurrency is a lie
  const fileId = Math.abs(
    hashFunction
      .update(filePath + type)
      .digest()
      .readInt32LE()
  );
  const file = await prisma.fileV2.upsert({
    where: {
      id: fileId,
    },
    create: {
      id: fileId,
      path: filePath,
      fileSource: {
        connect: {
          path: source.path,
        },
      },
      [type]: {
        connect: {
          id: targetEntity.id,
        },
      },
    },
    update: {
      path: filePath,
      fileSource: {
        connect: {
          path: source.path,
        },
      },
      [type]: {
        connect: {
          id: targetEntity.id,
        },
      },
    },
    include: {
      [type]: true,
      fileSource: true,
    },
  });
  const subtitle = await prisma.$transaction(
    potencialSubtitleTrack.map((subtitlePath) => {
      return prisma.subtitleTrack.upsert({
        where: {
          path_fileV2Id: {
            fileV2Id: file.id,
            path: subtitlePath,
          },
        },
        create: {
          fileV2: {
            connect: {
              id: file.id,
            },
          },
          path: subtitlePath,
        },
        update: {
          fileV2: {
            connect: {
              id: file.id,
            },
          },
          path: subtitlePath,
        },
      });
    })
  );
  console.log(
    applySuccessColor(
      `Saved file in id ${file.id} with ${subtitle.length} subtitle tracks`
    )
  );
  return file;
}

function cleanupTitleName(name: string) {
  return (
    name
      .replace(/\[.*?\]/g, "")
      .replace(/\{}.*?\}/g, "")
      .replace(/\<.*?\>/g, "")
      .replace(/^\s+|\s+$|\s+(?=\s)/g, "")
      // Remove pesky .'s
      .replace(/\./gi, " ")
      // Remove pesky _'s
      .replace(/\_/gi, " ")
      .replace(/\[|\]|\(|\)|\{|\}|\<|\>/g, "")
      // Remove Season shit
      .replace(/S(?<season>\d{1,2})E(?<episode>\d{1,2}).*/gi, "")
      .replace(/\-|\_|/gi, "")
      .replace(/\S+ EDITION/gi, "")
      .trim()
      // Remove "Ext | Extended label on file name"
      .replace(/Ext$|Extended$/gi, "")
  );
}

function getSeasonAndEpisodeNumberFromFilePath(filePath: string): {
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

function selectMostMatchingSearchData(
  searchData: SearchResult[],
  searchTerm: string
): SearchResult {
  let mostSimilarMatch = {
    score: 0,
    element: null as SearchResult | null,
  };
  searchTerm = searchTerm.toLocaleLowerCase();

  for (const search of searchData) {
    const { name } = search;
    const currentScore = compareTwoStrings(searchTerm, name.toLowerCase());

    if (currentScore > mostSimilarMatch.score) {
      mostSimilarMatch.score = currentScore;
      mostSimilarMatch.element = search;
    }
  }

  if (mostSimilarMatch.element) return mostSimilarMatch.element;
  return searchData[0];
}

expose(processSingleFileThreadWorker);
