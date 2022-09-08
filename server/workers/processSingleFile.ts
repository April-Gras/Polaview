import path from "node:path";
import {
  applyFailureColor,
  applySuccessColor,
  applyInfoColor,
} from "#/utils/log";

import { expose } from "threads";
import { AxiosError } from "axios";
import { PrismaClient, Title, ImdbSearch, SearchResult } from "@prisma/client";

import { compareTwoStrings } from "string-similarity";

import {
  makeServersideGetScraper,
  makeServersidePostScraper,
} from "#/axiosTransporter";

import { SearchType } from "~/types/Search";

const prisma = new PrismaClient();

type ProcessSingleFileThreadWorkerReturn = void;
export type ProcessSingleFileThreadWorker = (
  sourcePath: string,
  filePath: string,
  wholePath: string
) => Promise<ProcessSingleFileThreadWorkerReturn>;

const processSingleFileThreadWorker: ProcessSingleFileThreadWorker =
  async function (sourcePath, filePath, wholePath) {
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
      const { data } = await makeServersidePostScraper("/searchV2", {
        query: cleanTitleName,
        type: fileIsProbablyPartOfSerie ? "series" : "movie",
      });
      const mostProbableChoice = selectMostMatchingSearchData(
        data,
        cleanTitleName
      );

      console.log(
        applyInfoColor(` | Found search match ${mostProbableChoice.name}`)
      );

      if (mostProbableChoice.id.includes("movie"))
        await makeServersidePostScraper("/processEntity", {
          entityId: mostProbableChoice.id as `movie-${number}`,
          episodeInfo: undefined,
        });
      else if (mostProbableChoice.id.includes("serie")) {
        const episodeInfo = getSeasonAndEpisodeNumberFromFilePath(fileBaseName);

        await makeServersidePostScraper("/processEntity", {
          entityId: mostProbableChoice.id as `movie-${number}`,
          episodeInfo,
        });
      } else throw new Error("Unvalid entity type");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data)
        console.info(err.response?.data);
      console.log(err);
      console.info(applyFailureColor(` | Failed for ${filePath}`));
      return;
    }
  };

async function saveFileAndConnectToTitle(
  sourcePath: string,
  filePath: string,
  targetTitle: Title
) {
  const source = await prisma.fileSource.upsert({
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
  await prisma.file.upsert({
    where: {
      path: filePath,
    },
    create: {
      path: filePath,
      fileSourcePath: source.path,
      titleImdbId: targetTitle.imdbId,
    },
    update: {
      fileSourcePath: source.path,
      titleImdbId: targetTitle.imdbId,
    },
    select: {
      title: true,
      fileSource: true,
      path: true,
    },
  });
}

function cleanupTitleName(name: string) {
  return (
    name
      .replace(/\(.*?\)/g, "")
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
