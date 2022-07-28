import { Title, Person } from "@prisma/client";
import { expose } from "threads";
import puppeteer from "puppeteer";
import { getCastFromTitlePage } from "#/utils/getCastFromTitlePage";
import { getBrowserFromPuppeteer } from "#/utils/getBrowserFromPuppeteer";

type GetTitleFromEpisodesImdbIdThreadWorkerReturn = {
  title: Title;
  casts: Person[];
};
export type GetTitleFromEpisodesImdbIdThreadWorker = (
  imdbId: string
) => Promise<GetTitleFromEpisodesImdbIdThreadWorkerReturn>;

const getTitleFromEdpisodesImdbId: GetTitleFromEpisodesImdbIdThreadWorker =
  async (imdbId) => {
    const browser = await getBrowserFromPuppeteer(puppeteer);
    const page = await browser.newPage();

    await page.goto(`https://www.imdb.com/title/${imdbId}/`);
    const [casts, name, pictureUrl] = await Promise.all([
      getCastFromTitlePage(page),
      getTitleNameFromPage(page),
      getPictureUrlFromPage(page),
    ]);

    return {
      casts,
      title: {
        imdbId,
        name,
        pictureUrl,
        releaseYear: null,
        serieImdbId: null,
        mediaType: null,
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
  return pictureUrl;
}

expose(getTitleFromEdpisodesImdbId);
