import { Worker, spawn, expose, Pool } from "threads";
import {
  GetSeasonWorkerThread,
  GetSeasonWorkerThreadReturn,
} from "./getSeason";
import { Title, Person, Serie, Role } from "@prisma/client";

import { getImdbPageFromUrlAxiosTransporter } from "scraper/utils/provideAxiosGet";
import { JSDOM } from "jsdom";

import { getStoryLineFromDocucment } from "scraper/utils/getStorylineFromTitlePage";
import {
  getCastFromTitleDocument,
  getFullCreditDocumentFromTitleImdbId,
  getStaffByTypeFromFullCreditDocument,
  getRolesIdFromFullCreditDocumentAndTitleImdb,
} from "scraper/utils/getPersonsFromTitlePage";
import { removePictureCropDirectiveFromUrl } from "scraper/utils/removePictureCropDirectivesFromUrl";

export type GetTitleDataFromImdbIdThreadWorkerResult = {
  serie?: Serie;
  seasonsDescriptors?: Title["imdbId"][][];
  collection: {
    title: Title;
    casts: Person[];
    writers: Person[];
    directors: Person[];
    roleToCastRelation: Role[];
  }[];
};
export type GetTitleDataFromImdbIdThreadWorker = (
  imdbId: Title["imdbId"]
) => Promise<GetTitleDataFromImdbIdThreadWorkerResult>;

const getTitleDataFromImdbIdWorker: GetTitleDataFromImdbIdThreadWorker = async (
  imdbId
) => {
  const url = `https://www.imdb.com/title/${imdbId}/`;
  const { data } = await getImdbPageFromUrlAxiosTransporter.get(url);
  const fullCreditDocument = await getFullCreditDocumentFromTitleImdbId(imdbId);
  const { document } = new JSDOM(data).window;

  // If exist this means the title is part of a show with multiple episodes
  const episodeGuideElement =
    document.querySelector('a[aria-label="View episode guide"]') ||
    document.querySelector('a[aria-label="View all episodes"]');

  if (episodeGuideElement)
    return processSeasonFromEpisodeGuideElement(document, imdbId);

  // Regular title
  const [
    name,
    { releaseYear },
    pictureUrl,
    casts,
    writers,
    directors,
    roleToCastRelation,
    storyline,
  ] = await Promise.all([
    getNameFromDocument(document),
    getMetadatasFromDocument(document),
    getPictureUrlFromDocument(document),
    getStaffByTypeFromFullCreditDocument(fullCreditDocument, "cast"),
    getStaffByTypeFromFullCreditDocument(fullCreditDocument, "writer"),
    getStaffByTypeFromFullCreditDocument(fullCreditDocument, "director"),
    getRolesIdFromFullCreditDocumentAndTitleImdb(fullCreditDocument, imdbId),
    getStoryLineFromDocucment(document),
  ]);

  return {
    collection: [
      {
        title: {
          imdbId,
          releaseYear,
          name,
          storyline,
          pictureUrl,
          seasonId: null,
          episodeNumber: 0,
          createdOn: new Date(),
        },
        roleToCastRelation,
        casts,
        writers,
        directors,
      },
    ],
  };
};

async function getNameFromDocument(docuement: Document): Promise<string> {
  const nameElem = docuement.querySelector(
    ".ipc-page-section > div:nth-child(2) > div > h1"
  );

  if (!nameElem) throw "No name block";
  const name = nameElem.textContent;
  if (!name) throw "No name value";
  return name;
}

type ExpectedReturn = {
  releaseYear: number | null;
  mediaType: string | null;
};
async function getMetadatasFromDocument(
  document: Document
): Promise<ExpectedReturn> {
  const metadataBlock = document.querySelector(
    'a[aria-label="View episode guide"]'
  );

  if (!metadataBlock)
    return {
      mediaType: null,
      releaseYear: null,
    };

  const listElements = Array.from(metadataBlock.querySelectorAll("li > span"));
  if (!listElements.length) return { mediaType: null, releaseYear: null };
  const listTextContent = listElements.map((element) => element.textContent);
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

async function getPictureUrlFromDocument(
  document: Document
): Promise<string | null> {
  const pictureElem = document.querySelector("img.ipc-image");
  const pictureUrl = pictureElem ? pictureElem.getAttribute("src") : null;

  return removePictureCropDirectiveFromUrl(pictureUrl);
}

async function processSeasonFromEpisodeGuideElement(
  document: Document,
  episodeListingImdbId: string
): Promise<GetTitleDataFromImdbIdThreadWorkerResult> {
  const seasonCount = await getSeasonCountFromPage(document);
  if (!episodeListingImdbId) throw "Missing link for episode listing";
  const threadPool = Pool(
    () => spawn<GetSeasonWorkerThread>(new Worker("./getSeason.ts")),
    {
      concurrency: seasonCount / 2,
      size: 2,
      maxQueuedJobs: seasonCount,
    }
  );

  const tasks = [] as ReturnType<typeof threadPool.queue>[];

  for (let index = 0; index < seasonCount; index++)
    tasks.push(threadPool.queue((task) => task(episodeListingImdbId, index)));

  const results: GetSeasonWorkerThreadReturn[] = await Promise.all(tasks);

  await threadPool.terminate(true);

  if (results.length !== seasonCount) throw "Missmatch season count";
  return {
    serie: {
      ...results[0].serie,
      storyline: getStoryLineFromDocucment(document),
    },
    seasonsDescriptors: results.map(({ collection }) => {
      return collection.map((e) => e.title.imdbId);
    }),
    collection: results.flatMap(({ collection }) => {
      return collection;
    }),
  };
}

async function getSeasonCountFromPage(document: Document): Promise<number> {
  const seasonElement = document.getElementById("browse-episodes-season");

  if (!seasonElement) return 1;
  const seasonText = seasonElement.getAttribute("aria-label");

  if (typeof seasonText !== "string") throw "Season text is not a string";

  const matches = new RegExp(/([0-9]*) seasons?/gi).exec(seasonText);

  if (!matches || !matches[1]) throw "No matches for season regex";
  const seasonCount = Number(matches[1]);

  if (isNaN(seasonCount)) throw "Season count is NaN :<";

  return seasonCount;
}

expose(getTitleDataFromImdbIdWorker);
