import {
  PrismaClient,
  Prisma,
  MovieOnCast,
  EpisodeOnCast,
  MovieOnWriter,
  EpisodeOnWriter,
  MovieOnDirector,
  EpisodeOnDirector,
} from "@prisma/client";

type EntityType = "movie" | "episode";
type PeopleType = "cast" | "writer" | "director";
type Output<E extends EntityType, P extends PeopleType> = P extends "cast"
  ? E extends "movie"
    ? Prisma.Prisma__MovieOnCastClient<MovieOnCast>
    : Prisma.Prisma__EpisodeOnCastClient<EpisodeOnCast>
  : P extends "writer"
  ? E extends "movie"
    ? Prisma.Prisma__MovieOnWriterClient<MovieOnWriter>
    : Prisma.Prisma__EpisodeOnWriterClient<EpisodeOnWriter>
  : P extends "director"
  ? E extends "movie"
    ? Prisma.Prisma__MovieOnDirectorClient<MovieOnDirector>
    : Prisma.Prisma__EpisodeOnDirectorClient<EpisodeOnDirector>
  : never;

export function connectHumanCollectionToEntity<
  E extends EntityType,
  P extends PeopleType
>(
  prisma: PrismaClient,
  peoplIds: number[],
  entityId: number,
  peopleType: P,
  entityType: E
): Output<E, P>[] {
  const selectedCollection = getPrismaCollectionFromPeopleType(
    prisma,
    peopleType,
    entityType
  );

  return peoplIds.map((id) => {
    const payload = {
      [entityType]: {
        connect: {
          id: entityId,
        },
      },
      people: {
        connect: {
          id,
        },
      },
    };

    // @ts-expect-error
    return selectedCollection({
      where: {
        [`peopleId_${entityType}Id`]: {
          [`${entityType}Id`]: entityId,
          peopleId: id,
        },
      },
      create: payload,
      update: {},
    });
  });
}

function getPrismaCollectionFromPeopleType(
  prisma: PrismaClient,
  peopleType: PeopleType,
  entityType: EntityType
) {
  switch (peopleType) {
    case "cast":
      return (
        entityType === "episode" ? prisma.episodeOnCast : prisma.movieOnCast
      ).upsert;
    case "director":
      return (
        entityType === "episode"
          ? prisma.episodeOnDirector
          : prisma.movieOnDirector
      ).upsert;
    case "writer":
      return (
        entityType === "episode" ? prisma.episodeOnWriter : prisma.movieOnWriter
      ).upsert;
  }
}
