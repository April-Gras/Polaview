import { expose } from "threads";
import { Title, Person } from "@prisma/client";
import puppeteer from "puppeteer";
import { getBrowserFromPuppeteer } from "#/utils/getBrowserFromPuppeteer";

export type GetTitleDataFromImdbIdThreadWorkerResult = {
  title: Title;
  casts: Person[];
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

  const [name, releaseYear, pictureUrl] = await Promise.all([
    getNameFromPage(page),
    getReleaseYearFromPage(page),
    getPictureUrlFromPage(page),
  ]);

  return {
    title: {
      imdbId,
      releaseYear,
      name,
      pictureUrl: pictureUrl?.toString() ?? null,
    },
    casts: await getCastImdbIdsFromPage(page),
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

async function getReleaseYearFromPage(
  page: puppeteer.Page
): Promise<string | null> {
  const releaseDateElem = await page.$(
    ".ipc-page-section > div:nth-child(2) > div > div > ul > li > a"
  );

  return releaseDateElem
    ? await releaseDateElem.evaluate((e) => e.textContent)
    : null;
}

async function getPictureUrlFromPage(
  page: puppeteer.Page
): Promise<string | null> {
  const pictureElem = await page.$("img.ipc-image");
  return pictureElem
    ? await (await pictureElem.getProperty("src")).jsonValue()
    : null;
}

async function getCastImdbIdsFromPage(page: puppeteer.Page) {
  const personImdbIds = [] as Person[];
  const castElementArray = await page.$$(
    ".title-cast > div:nth-child(2) > .ipc-sub-grid .ipc-avatar"
  );

  for (const castElement of castElementArray) {
    const pictureElem = await castElement.$("img");
    const linkElement = await castElement.$("a");

    if (!pictureElem || !linkElement) continue;
    const personName = await (await pictureElem.getProperty("alt")).jsonValue();
    const pictureUrl = await (await pictureElem.getProperty("src")).jsonValue();
    const castLink = await (await linkElement.getProperty("href")).jsonValue();
    const imdbId = await getImdbIdFromCastLink(castLink);

    if (typeof personName !== "string") throw "Person name is no string";
    personImdbIds.push({
      imdbId,
      name: personName,
      pictureUrl: typeof pictureUrl !== "string" ? null : pictureUrl,
    });
  }
  return personImdbIds;
}

async function getImdbIdFromCastLink(link: unknown) {
  if (typeof link !== "string") throw "link was not a string";
  const regex = /https:\/\/www.imdb.com\/name\/(nm.*)\?/gi;
  const matches = regex.exec(link);

  if (!matches) throw "No regex link matches";
  return matches[1];
}

expose(getTitleDataFromImdbIdWorker);
