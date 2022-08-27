import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryScrapImdb";

import { GetTitleDataFromImdbIdThreadWorker } from "#/workers/getTitleFromImdbId";
import { SaveTitleAndPersonsThreadWorker } from "#/workers/saveTitleAndCast";

import { Worker, spawn } from "threads";
import { Title } from "@prisma/client";

async function scrapTitleData(imdbId: Title["imdbId"]) {
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
  const imdbId = req.params.imdbId;

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
      seasons: true,
    },
  });

  if (cachedSerie) throw "This is a series imdbId";
  const { collection, serie, seasonsDescriptors } = await scrapTitleData(
    imdbId
  );

  const saveTitleAndPersonsThread: SaveTitleAndPersonsThreadWorker =
    await spawn(new Worker("../workers/saveTitleAndCast.ts"));

  await saveTitleAndPersonsThread({ collection, serie, seasonsDescriptors });
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
  const imdbId = req.params.imdbId;
  const cachedCasts = await prisma.titleOnCast.findMany({
    where: {
      titleId: imdbId,
    },
    select: {
      person: true,
    },
  });

  return cachedCasts.map((e) => e.person);
};

export const getTitleWritersFromMovieImdbId: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/title/:imdbId/writers"
> = async (prisma, req) => {
  const imdbId = req.params.imdbId;
  const cachedWriters = await prisma.titleOnWriter.findMany({
    where: {
      titleId: imdbId,
    },
    select: {
      person: true,
    },
  });

  return cachedWriters.map((e) => e.person);
};

export const getTitleDirectorFromMovieImdbId: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/title/:imdbId/directors"
> = async (prisma, req) => {
  const imdbId = req.params.imdbId;
  const cachedDirectors = await prisma.titleOnDirector.findMany({
    where: {
      titleId: imdbId,
    },
    select: {
      person: true,
    },
  });

  return cachedDirectors.map((e) => e.person);
};

export const getTitleRolesFromMovieImdbId: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/title/:imdbId/roles"
> = async (prisma, req) => {
  const imdbId = req.params.imdbId;
  const roles = await prisma.role.findMany({
    where: {
      titleImdbId: imdbId,
    },
  });

  return roles;
};
