import {
  Episode,
  Movie,
  People,
  prisma,
  PrismaClient,
  SerieV2,
} from "@prisma/client";

import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes, EpisodeIndexInfo } from "~/types/RouteLibraryScraper";
import { TvDbPeople, TvDbCharacter } from "~/types/RouteLibraryTvDbApi";
import { tvDbGetRequest } from "#/tvDbApi";

export const processEntityIdPost: GetRouteDataHandlerFromUrlAndVerb<
  "post",
  AllRoutes,
  "/processEntity"
> = async (prisma, _, __, payload) => {
  const { entityId, episodeInfo } = payload;
  const { type, id } = getTypeAndIdFromEntityId(entityId);
  const cachedEntity = await getCachedEntity(prisma, type, id, episodeInfo);

  if (cachedEntity) return cachedEntity;
  if (type === "movie") return processIdAsMovie(prisma, id);
  return {} as Episode;
};

async function processIdAsMovie(
  prisma: PrismaClient,
  id: number
): Promise<Movie> {
  const {
    data: { data },
  } = await tvDbGetRequest(`/movies/${id.toString()}/extended`);
  const seekedPeopleType = ["Actor", "Writer", "Director"] as const;
  const peopleIds = data.characters.reduce(
    (accumulator, { peopleId, peopleType }) => {
      if (
        !accumulator.includes(peopleId) &&
        seekedPeopleType.includes(peopleType)
      )
        accumulator.push(peopleId);
      return accumulator;
    },
    [] as number[]
  );

  // Save all people
  const savedPeopleIds = await savePeoeplesFromIds(prisma, peopleIds);
  // Save all characters
  const savedCharacters = await saveCharacters(
    prisma,
    data.characters.filter((e) => e.peopleType === "Actors")
  );
  // Save movie

  //// Bind people to cast
  //// Bind people to writers
  //// Bind people to directors
  //// Bind casts to roles

  return {} as Movie;
}

async function saveCharacters(
  prisma: PrismaClient,
  tvdbCharacters: TvDbCharacter[]
) {
  // TODO
  // return prisma.
}

async function savePeoeplesFromIds(
  prisma: PrismaClient,
  peopleIds: number[]
): Promise<number[]> {
  const cachedPeoples = await prisma.people.findMany({
    where: {
      id: {
        in: peopleIds,
      },
    },
  });
  const cachedPeopleIds = cachedPeoples.map(({ id }) => id);
  const missingPeopleIds = peopleIds.filter(
    (id) => !cachedPeopleIds.includes(id)
  );
  const promises = missingPeopleIds.map((id) =>
    tvDbGetRequest(`/people/${id.toString()}/extended`)
  );
  const newPeople = (await Promise.allSettled(promises)).reduce(
    (accumulator, result) => {
      if (result.status === "fulfilled" && result.value)
        accumulator.push(result.value.data.data);
      return accumulator;
    },
    [] as TvDbPeople[]
  );

  // Create peoples
  if (!newPeople.length) return cachedPeopleIds;
  await prisma.people.createMany({
    data: newPeople.map((tvDbPeople) => ({
      birth: tvDbPeople.birth || undefined,
      birthPlace: tvDbPeople.birthPlace || undefined,
      death: tvDbPeople.death || undefined,
      id: tvDbPeople.id,
      name: tvDbPeople.name,
    })),
  });
  // Bind biographies to peoples
  await prisma.biography.createMany({
    data: newPeople.flatMap((tvDbPeople) => {
      if (!tvDbPeople.biographies) return [];
      return tvDbPeople.biographies.map((bio) => ({
        text: bio.biography,
        lang: bio.language,
        peopleId: tvDbPeople.id,
      }));
    }),
  });

  return [...cachedPeopleIds, ...missingPeopleIds];
}

async function getCachedEntity<T extends "movie" | "serie">(
  prisma: PrismaClient,
  type: T,
  id: number,
  ...args: T extends "movie"
    ? [episodeInfo?: undefined]
    : [episodeInfo: EpisodeIndexInfo]
): Promise<T extends "movie" ? Movie | null : Episode | null | null> {
  if (type === "movie") {
    const movie = await prisma.movie.findFirst({
      where: { id },
    });

    // @ts-expect-error
    return movie;
  }
  const episodeInfo = args[0];

  if (!episodeInfo)
    throw new Error("No episode info for season when looking in cache");
  const serie = await prisma.serieV2.findFirst({
    where: {
      id: id,
    },
    select: {
      seasons: {
        include: {
          episode: true,
        },
      },
    },
  });

  if (!serie) return null;
  const season = serie.seasons[episodeInfo.seasonNumber];

  if (!season) return null;

  // @ts-expect-error
  return season.episode[episodeInfo.episodeNumber] || null;
}

function getTypeAndIdFromEntityId(entityId: string | undefined): {
  type: "movie" | "serie";
  id: number;
} {
  const reg = /(?<type>movie|series)-(?<id>[0-9]*)/gim;
  if (!entityId || !entityId.length) throw new Error("No entityId");

  const matches = reg.exec(entityId);
  if (!matches || !matches.groups || !matches.groups.type || !matches.groups.id)
    throw new Error("could not find entity type or id");
  const id = Number(matches.groups.id);

  if (isNaN(id)) throw new Error("id is NaN");
  return {
    // @ts-expect-error
    type: matches.groups.type,
    id,
  };
}
