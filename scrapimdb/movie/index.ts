import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryScrapImdb";

import { GetTitleDataFromImdbIdThreadWorker } from "#/workers/getTitleFromImdbId";
import { SaveTitleAndPersonsThreadWorker } from "#/workers/saveTitleAndCast";

import { Worker, spawn } from "threads";

async function scrapTitleData(imdbId: string) {
  const getTitleDataFromImdbIdThread: GetTitleDataFromImdbIdThreadWorker =
    await spawn(new Worker("../workers/getTitleFromImdbId.ts"));
  const { title, casts } = await getTitleDataFromImdbIdThread(imdbId);

  return { title, casts };
}

export const movieGetByImdbId: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/movie/:imdbId"
> = async (prisma, req) => {
  const { imdbId } = req.params;

  const cachedTitle = await prisma.title.findUnique({
    where: {
      imdbId,
    },
  });

  if (cachedTitle) return cachedTitle;
  const { title, casts } = await scrapTitleData(imdbId);

  const saveTitleAndPersonsThread: SaveTitleAndPersonsThreadWorker =
    await spawn(new Worker("../workers/saveTitleAndCast.ts"));

  saveTitleAndPersonsThread({ title, casts });

  return title;
};

export const getMovieCastsFromMovieImdbId: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/movie/:imdbId/cast"
> = async (prisma, req, res) => {
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

  const { casts, title } = await scrapTitleData(imdbId);
  const saveTitleAndPersonsThread: SaveTitleAndPersonsThreadWorker =
    await spawn(new Worker("../workers/saveTitleAndCast.ts"));

  saveTitleAndPersonsThread({ title, casts });

  return casts;
};
