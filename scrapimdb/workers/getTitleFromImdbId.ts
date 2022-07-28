import { Worker, spawn, expose } from "threads";
import { GetTitlesFromEpisodeListThreadWorker } from "./getTitlesFromEpisodeList";
import { Title, Person, Serie } from "@prisma/client";
import puppeteer from "puppeteer";
import { getBrowserFromPuppeteer } from "#/utils/getBrowserFromPuppeteer";
import { getCastFromTitlePage } from "#/utils/getCastFromTitlePage";
import { extractImdbIdFromTitleLink } from "#/utils/extractImdbIdsFromUrl";

export type GetTitleDataFromImdbIdThreadWorkerResult = {
  serie?: Serie;
  collection: {
    title: Title;
    casts: Person[];
  }[];
};
export type GetTitleDataFromImdbIdThreadWorker = (
  imdbId: string
) => Promise<GetTitleDataFromImdbIdThreadWorkerResult>;

const getTitleDataFromImdbIdWorker: GetTitleDataFromImdbIdThreadWorker = async (
  imdbId
) => {
  const browser = await getBrowserFromPuppeteer(puppeteer);
  const page = await browser.newPage();

  await page.goto(`https://www.imdb.com/title/${imdbId}/`);

  // If exist this means the title is part of a show with multiple episodes
  const episodeGuideElement =
    (await page.$('a[aria-label="View episode guide"]')) ||
    (await page.$('a[aria-label="View all episodes"]'));

  if (episodeGuideElement) {
    const episodeGuideLink = await (
      await episodeGuideElement.getProperty("href")
    ).jsonValue();

    if (typeof episodeGuideLink !== "string")
      throw "Episode guide link is not a string";
    const episodeListingImdbId = extractImdbIdFromTitleLink(episodeGuideLink);
    if (!episodeListingImdbId) throw "Missing link for episode listing";
    const getTitlesFromEpisodeListWorker: GetTitlesFromEpisodeListThreadWorker =
      await spawn(new Worker("./getTitlesFromEpisodeList.ts"));

    console.log({ imdbId, episodeListingImdbId });
    return await getTitlesFromEpisodeListWorker(episodeListingImdbId);
  }

  // Regular title
  const [name, { releaseYear, mediaType }, pictureUrl] = await Promise.all([
    getNameFromPage(page),
    getMetadatasFromPage(page),
    getPictureUrlFromPage(page),
  ]);

  return {
    collection: [
      {
        title: {
          imdbId,
          releaseYear,
          mediaType,
          name,
          pictureUrl: pictureUrl?.toString() ?? null,
          serieImdbId: null,
        },
        casts: await getCastFromTitlePage(page),
      },
    ],
  };
};

async function getNameFromPage(page: puppeteer.Page): Promise<string> {
  const nameElem = await page.$(
    ".ipc-page-section > div:nth-child(2) > div > h1"
  );

  if (!nameElem) throw "No name block";
  const name = await nameElem.evaluate((e) => e.textContent);
  if (!name) throw "No name value";
  return name;
}

type ExpectedReturn = {
  releaseYear: number | null;
  mediaType: string | null;
};
async function getMetadatasFromPage(
  page: puppeteer.Page
): Promise<ExpectedReturn> {
  const metadataBlock = await page.$('a[aria-label="View episode guide"]');

  if (!metadataBlock)
    return {
      mediaType: null,
      releaseYear: null,
    };

  const listElements = await metadataBlock.$$("li > span");
  if (!listElements.length) return { mediaType: null, releaseYear: null };
  const listTextContent = await Promise.all(
    listElements.map((element) => element.evaluate((e) => e.textContent))
  );
  // Check if first value is year if, so we don't need to get more data since
  // The media type will always be before in the <ul />
  if (!Number.isNaN(Number(listTextContent[0])))
    return { releaseYear: Number(listTextContent[0]), mediaType: null };
  const potencialYear = Number(listTextContent[1]);
  const potencialMediaType = listTextContent[0];

  return {
    releaseYear: !isNaN(potencialYear) ? potencialYear : null,
    mediaType: potencialMediaType ? potencialMediaType : null,
  };
}

async function getPictureUrlFromPage(
  page: puppeteer.Page
): Promise<string | null> {
  const pictureElem = await page.$("img.ipc-image");
  return pictureElem
    ? await (await pictureElem.getProperty("src")).jsonValue()
    : null;
}

expose(getTitleDataFromImdbIdWorker);
