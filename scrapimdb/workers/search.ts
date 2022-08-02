import { expose } from "threads/worker";
import puppeteer from "puppeteer";
import { getBrowserFromPuppeteer } from "#/utils/getBrowserFromPuppeteer";
import { extractImdbIdFromTitleLink } from "#/utils/extractImdbIdsFromUrl";
import { Title } from "@prisma/client";

export type SearchThreadWorkerReturn = {
  thumbnailUrl: string | null;
  imdbId: Title["imdbId"];
  name: string;
};
export type SearchThreadWorker = (
  searchTerm: string
) => Promise<SearchThreadWorkerReturn[]>;

const searchThreadWorker: SearchThreadWorker = async (searchTerm: string) => {
  try {
    const browser = await getBrowserFromPuppeteer(puppeteer);
    const processedSearchTerm = searchTerm.replace(/ /gi, "+");
    const page = await browser.newPage();

    await page.goto(`https://www.imdb.com/find?q=${processedSearchTerm}&s=tt`);

    const resultEntries = await page.$$(".findResult");

    const results = (
      await Promise.all(resultEntries.map(evaluateResultEntry))
    ).reduce((accumulator, element) => {
      if (element) accumulator.push(element);
      return accumulator;
    }, [] as SearchThreadWorkerReturn[]);
    await browser.close();
    return results;
  } catch (err) {
    console.log(err);
    return [];
  }
};

async function evaluateResultEntry(
  resultEntry: puppeteer.ElementHandle<Element>
): Promise<SearchThreadWorkerReturn | null> {
  const linkElement = await resultEntry.$(".result_text > a");

  if (!linkElement) return null;

  const link = await linkElement.getProperty("href");
  const name = await linkElement.evaluate((el) => el.textContent);
  const imdbId = extractImdbIdFromTitleLink(await link.jsonValue());

  if (!imdbId || !name) return null;

  const pictureElement = await resultEntry.$(".primary_photo img");
  return {
    imdbId,
    name,
    thumbnailUrl: pictureElement
      ? // @ts-expect-error
        (await (await pictureElement.getProperty("src")).jsonValue()).toString()
      : null,
  };
}

expose(searchThreadWorker);
