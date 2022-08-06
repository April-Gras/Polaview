import { expose, Worker, spawn, Pool } from "threads";
import { Title, Person, Serie } from "@prisma/client";

import { extractImdbIdFromTitleLink } from "#/utils/extractImdbIdsFromUrl";
import { removePictureCropDirectiveFromUrl } from "#/utils/removePictureCropDirectivesFromUrl";
import {
  GetTitleFromEpisodesImdbIdThreadWorker,
  GetTitleFromEpisodesImdbIdThreadWorkerReturn,
} from "./getTitlesFromEpisodeImdbIds";

import axios from "axios";
import { JSDOM } from "jsdom";

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
  const url = `https://www.imdb.com/title/${imdbId}/episodes/?season=${
    seasonIndex + 1
  }`;
  const { data } = await axios.get(url);
  const { document } = new JSDOM(data).window;

  const [{ serieImdbId, serieName }, storyline, pictureUrl] = await Promise.all(
    [
      getSerieBaseInfoFromDocucment(document),
      getSeireStoryLineFromDocucment(document),
      getPictureUrlFromDocucment(document),
    ]
  );
  const linkElements = Array.from(
    document.querySelectorAll(".list.detail.eplist .list_item > .image > a")
  );
  const links = linkElements.map((e) => e.getAttribute("href"));
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

async function getSerieBaseInfoFromDocucment(
  document: Document
): Promise<{ serieName: Serie["name"]; serieImdbId: Serie["imdbId"] }> {
  const serieLinkElement = document.querySelector(
    ".subpage_title_block__right-column > div h3 > a"
  );

  if (!serieLinkElement) throw "Serie link element missing";
  const serieLink = serieLinkElement.getAttribute("href");
  const serieName = serieLinkElement.textContent;

  if (!serieName) throw "Missing serie name";
  return {
    serieImdbId: extractImdbIdFromTitleLink(serieLink),
    serieName,
  };
}

async function getPictureUrlFromDocucment(
  document: Document
): Promise<null | string> {
  const pictureElement = document.querySelector("img.poster");

  if (!pictureElement) return null;

  const pictureUrl = pictureElement.getAttribute("src");

  return removePictureCropDirectiveFromUrl(pictureUrl);
}

async function getSeireStoryLineFromDocucment(
  document: Document
): Promise<null | string> {
  const storylineElement = document.querySelector(
    'div[data-testid="storyline-plot-summary"] .ipc-html-content-inner-div'
  );

  if (!storylineElement) return null;
  const storylineText = storylineElement.textContent;

  return storylineText;
}

expose(getSeason);
