import { expose } from "threads/worker";
import puppeteer from "puppeteer";
import { getBrowserFromPuppeteer } from "#/utils/getBrowserFromPuppeteer";
import { removePictureCropDirectiveFromUrl } from "#/utils/removePictureCropDirectivesFromUrl";
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

enum SearchType {
  movie = "ft",
  TV = "tv",
}

const searchThreadWorker: SearchThreadWorker = async (searchTerm: string) => {
  try {
    const browser = await getBrowserFromPuppeteer(puppeteer);
    const processedSearchTerm = searchTerm.replace(/ /gi, "+");
    const page = await browser.newPage();

    await page.goto(`https://www.imdb.com/find?q=${processedSearchTerm}&s=tt`);

    const [movieMatches, tvMatches] = await Promise.all([
      findByTypeFromBrowser(browser, SearchType.movie, processedSearchTerm),
      findByTypeFromBrowser(browser, SearchType.TV, processedSearchTerm),
    ]);

    await browser.close();
    return [...movieMatches, ...tvMatches];
  } catch (err) {
    console.log(err);
    return [];
  }
};

async function findByTypeFromBrowser(
  browser: puppeteer.Browser,
  searchType: SearchType,
  processedSearchTerm: string
) {
  const page = await browser.newPage();
  await page.goto(
    `https://www.imdb.com/find?q=${processedSearchTerm}&s=tt&ttype=${searchType}`
  );

  const resultEntries = await page.$$(".findResult");

  const results = (
    await Promise.all(resultEntries.map(evaluateResultEntry))
  ).reduce((accumulator, element) => {
    if (element) accumulator.push(element);
    return accumulator;
  }, [] as SearchThreadWorkerReturn[]);
  return results;
}

async function evaluateResultEntry(
  resultEntry: puppeteer.ElementHandle<Element>
): Promise<SearchThreadWorkerReturn | null> {
  const parentDiv = await resultEntry.$(".result_text");
  if (!parentDiv) return null;
  const linkElement = await parentDiv.$("a");

  if (!linkElement) return null;

  const link = await linkElement.getProperty("href");
  const name = await linkElement.evaluate((el) => el.textContent);
  const textCheckForLowQualityRersults = await parentDiv.evaluate(
    (e) => e.textContent
  );
  const imdbId = extractImdbIdFromTitleLink(await link.jsonValue());

  if (
    !imdbId ||
    !name ||
    // Low qulity results can fuck off :>
    (textCheckForLowQualityRersults &&
      textCheckForLowQualityRersults.includes("in development"))
  )
    return null;

  const pictureElement = await resultEntry.$(".primary_photo img");
  const ret = {
    imdbId,
    name,
    thumbnailUrl: null,
  };
  if (pictureElement) {
    const thumbnailUrl = removePictureCropDirectiveFromUrl(
      await pictureElement.getProperty("src")
    );
    const placeholderThumbnail =
      "https://m.media-amazon.com/images/S/sash/85lhIiFCmSScRzu.png";

    // Low quality result can fuck off
    if (thumbnailUrl === placeholderThumbnail) return null;
    removePictureCropDirectiveFromUrl(thumbnailUrl);
    return {
      ...ret,
      thumbnailUrl,
    };
  }

  return ret;
}

expose(searchThreadWorker);
