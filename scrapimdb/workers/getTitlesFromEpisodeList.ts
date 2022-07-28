import { expose, Worker, spawn, Pool } from "threads";
import { Title, Person, Serie } from "@prisma/client";
import puppeteer from "puppeteer";
import { getBrowserFromPuppeteer } from "#/utils/getBrowserFromPuppeteer";
import { extractImdbIdFromTitleLink } from "#/utils/extractImdbIdsFromUrl";
import { GetTitleFromEpisodesImdbIdThreadWorker } from "./getTitlesFromEpisodeImdbIds";

export type GetTitlesFromEpisodeListThreadWorkerReturn = {
  serie: Serie;
  collection: {
    title: Title;
    casts: Person[];
  }[];
};
export type GetTitlesFromEpisodeListThreadWorker = (
  imdbId: string
) => Promise<GetTitlesFromEpisodeListThreadWorkerReturn>;

const getTitlesFromEpisodeList: GetTitlesFromEpisodeListThreadWorker = async (
  imdbId
) => {
  const browser = await getBrowserFromPuppeteer(puppeteer);
  const page = await browser.newPage();

  await page.goto(`https://www.imdb.com/title/${imdbId}/episodes/`);

  const { serieImdbId, serieName } = await getSerieInfoFromPage(page);
  const linkElements = await page.$$(
    ".list.detail.eplist .list_item > .image > a"
  );
  const linkAttributeJsHandlers = await Promise.all(
    linkElements.map((e) => e.getProperty("href"))
  );
  const links = await Promise.all(
    linkAttributeJsHandlers.map((element) => element.jsonValue())
  );
  const imdbIds = links.reduce((accumulator: string[], link: unknown) => {
    const processedLink = extractImdbIdFromTitleLink(link);
    if (!processedLink) throw "Found some broken links, aborting";
    accumulator.push(processedLink);
    return accumulator;
  }, []);

  const threadPool = Pool(
    () => {
      return spawn<GetTitleFromEpisodesImdbIdThreadWorker>(
        new Worker("./getTitlesFromEpisodeImdbIds.ts")
      );
    },
    {
      maxQueuedJobs: imdbIds.length,
      concurrency: 4,
    }
  );

  const tasks = imdbIds.map((imdbId) =>
    threadPool.queue((task) => task(imdbId))
  );
  const results = await Promise.all(tasks);

  await threadPool.terminate();

  return {
    collection: results,
    serie: {
      imdbId: serieImdbId,
      name: serieName,
    },
  };
};

async function getSerieInfoFromPage(
  page: puppeteer.Page
): Promise<{ serieName: string; serieImdbId: string }> {
  const serieLinkElement = await page.$(
    ".subpage_title_block__right-column > div h3 > a"
  );

  if (!serieLinkElement) throw "Serie link element missing";
  const serieLinkHrefProp = await serieLinkElement.getProperty("href");
  const serieName = await serieLinkElement.evaluate((e) => e.textContent);

  if (!serieName) throw "Missing serie name";
  return {
    serieImdbId: extractImdbIdFromTitleLink(
      await serieLinkHrefProp.jsonValue()
    ),
    serieName,
  };
}

expose(getTitlesFromEpisodeList);
