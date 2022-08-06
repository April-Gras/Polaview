import { Worker, spawn, expose, Pool } from "threads";
import {
  GetSeasonWorkerThread,
  GetSeasonWorkerThreadReturn,
} from "./getSeason";
import { Title, Person, Serie } from "@prisma/client";
import puppeteer from "puppeteer";
import { getBrowserFromPuppeteer } from "#/utils/getBrowserFromPuppeteer";
import { getCastFromTitlePage } from "#/utils/getCastFromTitlePage";
import { extractImdbIdFromTitleLink } from "#/utils/extractImdbIdsFromUrl";
import { removePictureCropDirectiveFromUrl } from "#/utils/removePictureCropDirectivesFromUrl";

export type GetTitleDataFromImdbIdThreadWorkerResult = {
  serie?: Serie;
  seasonsDescriptors?: Title["imdbId"][][];
  collection: {
    title: Title;
    casts: Person[];
  }[];
};
export type GetTitleDataFromImdbIdThreadWorker = (
  imdbId: Title["imdbId"]
) => Promise<GetTitleDataFromImdbIdThreadWorkerResult>;

const getTitleDataFromImdbIdWorker: GetTitleDataFromImdbIdThreadWorker = async (
  imdbId
) => {
  const browser = await getBrowserFromPuppeteer(puppeteer);
  const page = await browser.newPage();
  const url = `https://www.imdb.com/title/${imdbId}/`;

  console.info(`Going to ${url}`);
  await page.goto(url, {
    timeout: 0,
  });

  // If exist this means the title is part of a show with multiple episodes
  const episodeGuideElement =
    (await page.$('a[aria-label="View episode guide"]')) ||
    (await page.$('a[aria-label="View all episodes"]'));

  if (episodeGuideElement)
    return processSeasonFromEpisodeGuideElement(page, episodeGuideElement);

  // Regular title
  const [name, { releaseYear }, pictureUrl] = await Promise.all([
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
          name,
          pictureUrl: pictureUrl?.toString() ?? null,
          seasonId: null,
          episodeNumber: 0,
          createdOn: new Date(),
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
  const pictureUrl = pictureElem
    ? await (await pictureElem.getProperty("src")).jsonValue()
    : null;

  return removePictureCropDirectiveFromUrl(pictureUrl);
}

async function processSeasonFromEpisodeGuideElement(
  page: puppeteer.Page,
  episodeGuideElement: puppeteer.ElementHandle<Element>
): Promise<GetTitleDataFromImdbIdThreadWorkerResult> {
  const episodeGuideLink = await (
    await episodeGuideElement.getProperty("href")
  ).jsonValue();

  if (typeof episodeGuideLink !== "string")
    throw "Episode guide link is not a string";
  const episodeListingImdbId = extractImdbIdFromTitleLink(episodeGuideLink);
  const seasonCount = await getSeasonCountFromPage(page);
  if (!episodeListingImdbId) throw "Missing link for episode listing";
  const threadPool = Pool(
    () => {
      return spawn<GetSeasonWorkerThread>(new Worker("./getSeason.ts"));
    },
    {
      maxQueuedJobs: seasonCount,
    }
  );

  const tasks = [] as ReturnType<typeof threadPool.queue>[];

  for (let index = 0; index < seasonCount; index++)
    tasks.push(threadPool.queue((task) => task(episodeListingImdbId, index)));

  const results: GetSeasonWorkerThreadReturn[] = await Promise.all(tasks);

  await threadPool.terminate();

  if (results.length !== seasonCount) throw "Missmatch season count";
  return {
    serie: results[0].serie,
    seasonsDescriptors: results.map(({ collection }) => {
      return collection.map((e) => e.title.imdbId);
    }),
    collection: results.flatMap(({ collection }) => {
      return collection;
    }),
  };
}

async function getSeasonCountFromPage(page: puppeteer.Page): Promise<number> {
  const seasonElement = await page.$("#browse-episodes-season");

  if (!seasonElement) return 1;
  const seasonText = await seasonElement.evaluate((e) =>
    e.getAttribute("aria-label")
  );

  if (typeof seasonText !== "string") throw "Season text is not a string";

  const matches = new RegExp(/([0-9]*) seasons?/gi).exec(seasonText);

  if (!matches || !matches[1]) throw "No matches for season regex";
  const seasonCount = Number(matches[1]);

  if (isNaN(seasonCount)) throw "Season count is NaN :<";

  return seasonCount;
}

expose(getTitleDataFromImdbIdWorker);
