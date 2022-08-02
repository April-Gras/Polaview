import path from "node:path";

import { AxiosScrapperPostRequest } from "~/types/Axios";

import { expose } from "threads";
import { AxiosError } from "axios";
import { PrismaClient, Title, ImdbSearch } from "@prisma/client";

import {
  makeServersidePostScrapImdb,
  makeServersideGetcrapImdb,
} from "~/axiosTransporters/index";

const prisma = new PrismaClient();

type ProcessSingleFileThreadWorkerReturn = void;
export type ProcessSingleFileThreadWorker = (
  sourcePath: string,
  filePath: string
) => Promise<ProcessSingleFileThreadWorkerReturn>;

async function processSingleFileThreadWorker(
  sourcePath: string,
  filePath: string
) {
  const magicRegex =
    /^(.+?)[.( \t]*(?:(?:(19\d{2}|20(?:0\d|1[0-9]))).*|(?:(?=bluray|\d+p|brrip|WEBRip)..*)?[.](mkv|avi|mpe?g|mp4)$)/gim;

  const regexReturn = magicRegex.exec(path.basename(filePath));
  if (!regexReturn) return;
  const [, movieTitle] = regexReturn;
  const cleanTitleName = cleanupTitleName(movieTitle);

  try {
    const searchDataResponse = (
      await makeServersidePostScrapImdb("/search", {
        term: cleanTitleName,
      })
    ).data;

    if (!searchDataResponse.length) {
      console.info(`No matches for ${cleanTitleName}`);
      return;
    }

    const matchingSearchElement = selectMostMatchingSearchData(
      searchDataResponse,
      cleanTitleName
    );

    console.log(cleanTitleName, { matchingSearchElement });

    try {
      const titleData = (
        await makeServersideGetcrapImdb(
          `/title/${matchingSearchElement.imdbId}`
        )
      ).data;

      console.log(`${cleanTitleName} got a title match`);

      await saveFileAndConnectToTitle(sourcePath, filePath, titleData);
    } catch (_) {
      const serieData = (
        await makeServersideGetcrapImdb(
          `/serie/${matchingSearchElement.imdbId}`
        )
      ).data;
      const { seasonNumber, episodeNumber } =
        getSeasonAndEpisodeNumberFromFilePath(filePath);

      const targetSeason = serieData.seasons[seasonNumber - 1];
      if (!targetSeason)
        throw `Could not find season with index ${seasonNumber - 1}`;
      const targetEpisode = targetSeason.episodes[episodeNumber - 1];
      if (!targetEpisode)
        throw `Could not find episode with index ${episodeNumber - 1}`;

      console.log(
        `${cleanTitleName} got a serie match for E${episodeNumber} and S${seasonNumber}`,
        `title id should be ${targetEpisode.imdbId} ${targetEpisode.name}`
      );
      await saveFileAndConnectToTitle(sourcePath, filePath, targetEpisode);
    }
  } catch (err) {
    if (err instanceof AxiosError && err.response?.data)
      console.info(err.response?.data);
    console.info(`Failed for ${filePath}`);
    console.log(err);
    return;
  }
}

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
      .trim()
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
  searchData: Omit<ImdbSearch, "imdbSearchCacheTerm">[],
  searchTerm: string
) {
  const goldenMatch = searchData.find(({ name }) => searchTerm === name);
  const nextBestMatch = searchData.find(
    ({ name }) => searchTerm.includes(name) || name.includes(searchTerm)
  );

  return goldenMatch || nextBestMatch || searchData[0];
}

expose(processSingleFileThreadWorker);
