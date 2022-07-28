import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryScrapImdb";

import { GetTitleDataFromImdbIdThreadWorker } from "#/workers/getTitleFromImdbId";
import { SaveTitleAndPersonsThreadWorker } from "#/workers/saveTitleAndCast";

import { Worker, spawn } from "threads";

async function scrapTitleData(imdbId: string) {
  const getTitleDataFromImdbIdThread: GetTitleDataFromImdbIdThreadWorker =
    await spawn(new Worker("../workers/getTitleFromImdbId.ts"));
  const collection = await getTitleDataFromImdbIdThread(imdbId);

  return collection;
}

export const titleGetByImdbId: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/title/:imdbId"
> = async (prisma, req) => {
  const { imdbId } = req.params;

  const cachedTitle = await prisma.title.findUnique({
    where: {
      imdbId,
    },
  });

  if (cachedTitle) return cachedTitle;
  const cachedSerie = await prisma.serie.findFirst({
    where: {
      imdbId: imdbId,
    },
    include: {
      episodes: true,
    },
  });

  if (cachedSerie) throw "This is a series imdbId";
  const { collection, serie } = await scrapTitleData(imdbId);

  const saveTitleAndPersonsThread: SaveTitleAndPersonsThreadWorker =
    await spawn(new Worker("../workers/saveTitleAndCast.ts"));

  console.log({ serie });
  saveTitleAndPersonsThread({ collection, serie });
  const match = collection.find((e) => e.title.imdbId === imdbId);

  if (!match)
    throw "No match for this imdb title, probably part of an episode list";
  return match.title;
};

export const getTitleCastsFromMovieImdbId: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/title/:imdbId/cast"
> = async (prisma, req) => {
  const { imdbId } = req.params;
  const cachedCasts = await prisma.titleOnCast.findMany({
    where: {
      titleId: imdbId,
    },
    select: {
      person: true,
    },
  });

  if (cachedCasts.length) return cachedCasts.map((e) => e.person);

  const { collection, serie } = await scrapTitleData(imdbId);
  const saveTitleAndPersonsThread: SaveTitleAndPersonsThreadWorker =
    await spawn(new Worker("../workers/saveTitleAndCast.ts"));

  saveTitleAndPersonsThread({ collection, serie });
  const match = collection.find((e) => e.title.imdbId === imdbId);

  if (!match)
    throw "No match for this imdb title, probably part of an episode list";
  return match.casts;
};
