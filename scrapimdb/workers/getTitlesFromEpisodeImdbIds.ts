import { Title, Person } from "@prisma/client";
import { expose } from "threads";
import puppeteer from "puppeteer";
import { getCastFromTitlePage } from "#/utils/getCastFromTitlePage";
import { getBrowserFromPuppeteer } from "#/utils/getBrowserFromPuppeteer";
import { removePictureCropDirectiveFromUrl } from "#/utils/removePictureCropDirectivesFromUrl";

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
    const browser = await getBrowserFromPuppeteer(puppeteer);
    const page = await browser.newPage();
    const url = `https://www.imdb.com/title/${imdbId}/`;

    await page.goto(url, {
      timeout: 0,
    });
    const [casts, name, pictureUrl, { episodeNumber, seasonNumber }] =
      await Promise.all([
        getCastFromTitlePage(page),
        getTitleNameFromPage(page),
        getPictureUrlFromPage(page),
        getEpisodeNumberAndSeasonNumberFromPage(page),
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

async function getTitleNameFromPage(page: puppeteer.Page): Promise<string> {
  const nameElement = await page.$(".ipc-page-section h1");

  if (!nameElement) throw "No title element";
  const nameString = await nameElement.evaluate((e) => e.textContent);

  if (!nameString) throw "Title result not a string";
  return nameString;
}

async function getPictureUrlFromPage(
  page: puppeteer.Page
): Promise<string | null> {
  const imageElement = await page.$(".ipc-page-section .ipc-media img");

  if (!imageElement) return null;
  const imageProperty = await imageElement.getProperty("src");
  const pictureUrl = await imageProperty.jsonValue();

  if (typeof pictureUrl !== "string") return null;
  return removePictureCropDirectiveFromUrl(pictureUrl);
}

async function getEpisodeNumberAndSeasonNumberFromPage(
  page: puppeteer.Page
): Promise<{
  episodeNumber: Title["episodeNumber"];
  seasonNumber: number;
}> {
  const reg = new RegExp(
    /S(?<seasonNumber>[0-9]).E(?<episodeNumber>[0-9])/,
    "gi"
  );
  const textElement = await page.$(
    'div[data-testid="hero-subnav-bar-season-episode-numbers-section-xs"]'
  );

  if (!textElement) throw "Could not get episode / season number element";
  const textContent = await textElement.evaluate((e) => e.textContent);

  if (!textContent) throw "No episode marking string in element could be found";
  const matches = reg.exec(textContent);

  if (!matches) throw "No matches on season episode regex";
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
