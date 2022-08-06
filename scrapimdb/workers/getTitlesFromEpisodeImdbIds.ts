import { Title, Person } from "@prisma/client";
import { expose } from "threads";
import { getCastFromTitleDocument } from "#/utils/getCastFromTitlePage";
import { removePictureCropDirectiveFromUrl } from "#/utils/removePictureCropDirectivesFromUrl";

import { JSDOM } from "jsdom";
import axios from "axios";

export type GetTitleFromEpisodesImdbIdThreadWorkerReturn = {
  title: Title;
  casts: Person[];
  seasonNumber: number;
};
export type GetTitleFromEpisodesImdbIdThreadWorker = (
  imdbId: Title["imdbId"]
) => Promise<GetTitleFromEpisodesImdbIdThreadWorkerReturn>;

const getTitleFromEdpisodesImdbId: GetTitleFromEpisodesImdbIdThreadWorker =
  async (imdbId) => {
    const url = `https://www.imdb.com/title/${imdbId}/`;
    const { data } = await axios.get(url);
    const { document } = new JSDOM(data).window;

    const [casts, name, pictureUrl, { episodeNumber, seasonNumber }] =
      await Promise.all([
        getCastFromTitleDocument(document),
        getTitleNameFromdocument(document),
        getPictureUrlFromDocument(document),
        getEpisodeNumberAndSeasonNumberFromDocument(document),
      ]);

    return {
      casts,
      seasonNumber,
      title: {
        imdbId,
        name,
        pictureUrl,
        releaseYear: null,
        seasonId: null,
        episodeNumber,
        createdOn: new Date(),
      },
    };
  };

async function getTitleNameFromdocument(document: Document): Promise<string> {
  const nameElement = document.querySelector(".ipc-page-section h1");

  if (!nameElement) throw "No title element";
  const nameString = nameElement.textContent;

  if (!nameString) throw "Title result not a string";
  return nameString;
}

async function getPictureUrlFromDocument(
  document: Document
): Promise<string | null> {
  const imageElement = document.querySelector(
    ".ipc-page-section .ipc-media img"
  );

  if (!imageElement) return null;
  const pictureUrl = await imageElement.getAttribute("src");

  return removePictureCropDirectiveFromUrl(pictureUrl);
}

async function getEpisodeNumberAndSeasonNumberFromDocument(
  document: Document
): Promise<{
  episodeNumber: Title["episodeNumber"];
  seasonNumber: number;
}> {
  const reg = new RegExp(
    /S(?<seasonNumber>[0-9]*).E(?<episodeNumber>[0-9]*)/,
    "gi"
  );
  const textElement = document.querySelector(
    'div[data-testid="hero-subnav-bar-season-episode-numbers-section-xs"]'
  );

  if (!textElement) throw "Could not get episode / season number element";
  const textContent = textElement.textContent;

  if (!textContent) throw "No episode marking string in element could be found";
  const matches = reg.exec(textContent);

  if (!matches) throw new Error("No matches on season episode regex");
  const { groups } = matches;

  if (!groups || !groups.seasonNumber || !groups.episodeNumber)
    throw "regex had non regular group matches";

  const seasonNumber = Number(groups.seasonNumber);
  const episodeNumber = Number(groups.episodeNumber);

  if (isNaN(episodeNumber) || isNaN(seasonNumber))
    throw "episode number or season number";
  return { seasonNumber, episodeNumber };
}

expose(getTitleFromEdpisodesImdbId);
