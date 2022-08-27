import { Title, Person, Role } from "@prisma/client";
import { expose } from "threads";
import {
  getCastFromTitleDocument,
  getFullCreditDocumentFromTitleImdbId,
  getStaffByTypeFromFullCreditDocument,
  getRolesIdFromFullCreditDocumentAndTitleImdb,
} from "#/utils/getPersonsFromTitlePage";
import { removePictureCropDirectiveFromUrl } from "#/utils/removePictureCropDirectivesFromUrl";

import { JSDOM } from "jsdom";
import { getImdbPageFromUrlAxiosTransporter } from "#/utils/provideAxiosGet";
import { getStoryLineFromDocucment } from "#/utils/getStorylineFromTitlePage";

export type GetTitleFromEpisodesImdbIdThreadWorkerReturn = {
  title: Title;
  casts: Person[];
  writers: Person[];
  directors: Person[];
  roleToCastRelation: Role[];
  seasonNumber: number;
};
export type GetTitleFromEpisodesImdbIdThreadWorker = (
  imdbId: Title["imdbId"]
) => Promise<GetTitleFromEpisodesImdbIdThreadWorkerReturn>;

const getTitleFromEdpisodesImdbId: GetTitleFromEpisodesImdbIdThreadWorker =
  async (imdbId) => {
    const url = `https://www.imdb.com/title/${imdbId}/`;
    const { data } = await getImdbPageFromUrlAxiosTransporter.get(url);
    const { document } = new JSDOM(data).window;
    const fullCreditDocument = await getFullCreditDocumentFromTitleImdbId(
      imdbId
    );

    const [
      casts,
      name,
      pictureUrl,
      { episodeNumber, seasonNumber },
      storyline,
      writers,
      directors,
      roleToCastRelation,
    ] = await Promise.all([
      getCastFromTitleDocument(document),
      getTitleNameFromdocument(document),
      getPictureUrlFromDocument(document),
      getEpisodeNumberAndSeasonNumberFromDocument(document),
      getStoryLineFromDocucment(document),
      getStaffByTypeFromFullCreditDocument(fullCreditDocument, "writer"),
      getStaffByTypeFromFullCreditDocument(fullCreditDocument, "director"),
      getRolesIdFromFullCreditDocumentAndTitleImdb(fullCreditDocument, imdbId),
    ]);

    return {
      casts,
      seasonNumber,
      writers,
      roleToCastRelation,
      directors,
      title: {
        imdbId,
        name,
        pictureUrl,
        storyline,
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
  const pictureUrl = imageElement.getAttribute("src");

  return removePictureCropDirectiveFromUrl(pictureUrl);
}

async function getEpisodeNumberAndSeasonNumberFromDocument(
  document: Document
): Promise<{
  episodeNumber: Title["episodeNumber"];
  seasonNumber: number;
}> {
  const reg = new RegExp(
    /S(?<seasonNumber>[0-9]*).?E?(?<episodeNumber>[0-9]*)?/,
    "gi"
  );
  const textElement =
    document.querySelector(
      'div[data-testid="hero-subnav-bar-season-episode-numbers-section-xs"]'
    ) ||
    document.querySelector(
      'div[data-testid="hero-subnav-bar-season-episode-numbers-section"]'
    );

  if (!textElement) throw "Could not get episode / season number element";
  const textContent = textElement.textContent;

  if (!textContent) throw "No episode marking string in element could be found";
  const matches = reg.exec(textContent);

  if (!matches) throw new Error("No matches on season episode regex");
  const { groups } = matches;

  if (!groups || !groups.seasonNumber)
    throw "regex had non regular group matches";

  const seasonNumber = Number(groups.seasonNumber);
  // Pilots have episode 0 !
  const episodeNumber = groups.episodeNumber ? Number(groups.episodeNumber) : 0;

  if (isNaN(episodeNumber) || isNaN(seasonNumber))
    throw "episode number or season number";
  return { seasonNumber, episodeNumber };
}

expose(getTitleFromEdpisodesImdbId);
