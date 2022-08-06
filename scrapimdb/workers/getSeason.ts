import { expose, Worker, spawn, Pool } from "threads";
import { Title, Person, Serie, Season } from "@prisma/client";
import puppeteer from "puppeteer";
import { getBrowserFromPuppeteer } from "#/utils/getBrowserFromPuppeteer";
import { extractImdbIdFromTitleLink } from "#/utils/extractImdbIdsFromUrl";
import { removePictureCropDirectiveFromUrl } from "#/utils/removePictureCropDirectivesFromUrl";
import {
  GetTitleFromEpisodesImdbIdThreadWorker,
  GetTitleFromEpisodesImdbIdThreadWorkerReturn,
} from "./getTitlesFromEpisodeImdbIds";

export type GetSeasonWorkerThreadReturn = {
  serie: Serie;
  seasonIndex: number;
  collection: {
    title: Title;
    casts: Person[];
    seasonNumber: number;
  }[];
};
export type GetSeasonWorkerThread = (
  imdbId: Title["imdbId"],
  seasonIndex: number
) => Promise<GetSeasonWorkerThreadReturn>;

const getSeason: GetSeasonWorkerThread = async (imdbId, seasonIndex) => {
  const browser = await getBrowserFromPuppeteer(puppeteer);
  const page = await browser.newPage();
  const url = `https://www.imdb.com/title/${imdbId}/episodes/?season=${
    seasonIndex + 1
  }`;

  await page.goto(url, {
    timeout: 0,
  });

  const [{ serieImdbId, serieName }, storyline, pictureUrl] = await Promise.all(
    [
      getSerieBaseInfoFromPage(page),
      getSeireStoryLineFromPage(page),
      getPictureUrlFromPage(page),
    ]
  );
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
    }
  );

  const tasks = imdbIds.map((imdbId) =>
    threadPool.queue((task) => task(imdbId))
  );
  const results: GetTitleFromEpisodesImdbIdThreadWorkerReturn[] =
    await Promise.all(tasks);

  await threadPool.terminate();

  return {
    collection: results,
    seasonIndex,
    serie: {
      imdbId: serieImdbId,
      name: serieName,
      pictureUrl,
      storyline,
      createdOn: new Date(),
    },
  };
};

async function getSerieBaseInfoFromPage(
  page: puppeteer.Page
): Promise<{ serieName: Serie["name"]; serieImdbId: Serie["imdbId"] }> {
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

async function getPictureUrlFromPage(
  page: puppeteer.Page
): Promise<null | string> {
  const pictureElement = await page.$("img.poster");

  if (!pictureElement) return null;

  const pictureUrl = await (
    await pictureElement.getProperty("src")
  ).jsonValue();

  return removePictureCropDirectiveFromUrl(pictureUrl);
}

async function getSeireStoryLineFromPage(
  page: puppeteer.Page
): Promise<null | string> {
  const storylineElement = await page.$(
    'div[data-testid="storyline-plot-summary"] .ipc-html-content-inner-div'
  );

  if (!storylineElement) return null;
  const storylineText = await storylineElement.evaluate((e) => e.textContent);

  return storylineText;
}

expose(getSeason);
