import {
  Character,
  Episode,
  Movie,
  People,
  Prisma,
  MovieOnCast,
  PrismaClient,
} from "@prisma/client";

import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes, EpisodeIndexInfo } from "~/types/RouteLibraryScraper";
import {
  TvDbPeople,
  TvDbCharacter,
  TvDbMovie,
} from "~/types/RouteLibraryTvDbApi";
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
  const peopleId = [] as number[];
  const currentCharacters = data.characters.reduce((accumulator, character) => {
    if (
      !peopleId.includes(character.peopleId) &&
      seekedPeopleType.includes(character.peopleType)
    ) {
      peopleId.push(character.peopleId);
      accumulator.push(character);
    }
    return accumulator;
  }, [] as TvDbCharacter[]);
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

  // Save movie
  const movie = await saveMovie(prisma, data);
  // Save all people
  const savedPeopleIds = await savePeoeplesFromIds(prisma, peopleIds);
  // Save all characters
  await saveCharacters(
    prisma,
    data.characters.filter((e) => e.peopleType === "Actor"),
    { movieId: id }
  );
  //// Bind people to cast
  await prisma.$transaction(
    saveMovieOnHuman(prisma, "Actor", currentCharacters, savedPeopleIds, id)
  );
  // TODO Bind people to writer
  // TODO Bind people to director

  return movie;
}

function saveMovieOnHuman(
  prisma: PrismaClient,
  targetPeopleType: TvDbCharacter["peopleType"],
  characterSet: TvDbCharacter[],
  savedPeopleIds: number[],
  movieId: number
) {
  return characterSet.reduce((accumulator, { peopleId, peopleType }) => {
    if (savedPeopleIds.includes(peopleId) && targetPeopleType === peopleType) {
      accumulator.push(
        prisma.movieOnCast.create({
          data: {
            movie: {
              connect: {
                id: movieId,
              },
            },
            people: {
              connect: {
                id: peopleId,
              },
            },
          },
        })
      );
    }
    return accumulator;
  }, [] as Prisma.Prisma__MovieOnCastClient<MovieOnCast>[]);
}

async function saveMovie(prisma: PrismaClient, movie: TvDbMovie) {
  return prisma.movie.create({
    data: {
      id: movie.id,
      name: movie.name,
      year: Number(movie.year),
      image: movie.image,
    },
  });
}

async function saveCharacters<MID extends number | undefined>(
  prisma: PrismaClient,
  tvdbCharacters: TvDbCharacter[],
  ...args: [
    MID extends number
      ? { movieId: number; episodeId?: undefined }
      : { movieId?: undefined; episodeId: number }
  ]
) {
  const { episodeId, movieId } = args[0];

  return prisma.character.createMany({
    data: tvdbCharacters.map(({ id, image, name, peopleId }) => {
      return {
        episodeId,
        movieId,
        peopleId,
        id,
        name,
        image,
      };
    }),
  });
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
