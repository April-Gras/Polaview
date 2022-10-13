import { PrismaClient } from "@prisma/client";

import { upsertPeopleCollection } from "#/transactionsV2/upsertPeopleCollection";
import { upsertBiographyCollection } from "#/transactionsV2/upsertBiographyCollection";
import { upsertActorCharacterCollection } from "#/transactionsV2/upsertActorCharacterCollection";
import { connectHumanCollectionToEntity } from "#/transactionsV2/connectHumanCollectionToEntity";
import {
  TvDbEpisode,
  TvDbMovie,
  TvDbPeople,
} from "~/types/RouteLibraryTvDbApi";

export function handleHumans(
  prisma: PrismaClient,
  id: number,
  entity: TvDbMovie | TvDbEpisode,
  allPeoples: TvDbPeople[],
  cast: TvDbPeople[],
  writers: TvDbPeople[],
  directors: TvDbPeople[],
  entityType: "movie" | "episode"
) {
  return [
    ...upsertPeopleCollection(prisma, allPeoples),
    ...upsertBiographyCollection(prisma, allPeoples),
    ...connectHumanCollectionToEntity(
      prisma,
      cast.map((e) => e.id),
      id,
      "cast",
      entityType
    ),
    ...connectHumanCollectionToEntity(
      prisma,
      writers.map((e) => e.id),
      id,
      "writer",
      entityType
    ),
    ...connectHumanCollectionToEntity(
      prisma,
      directors.map((e) => e.id),
      id,
      "director",
      entityType
    ),
    ...upsertActorCharacterCollection(
      prisma,
      (entity.characters || []).filter(
        (e) => ["Actor", "Guest Star"].includes(e.peopleType) && !!e.name
      ),
      id,
      entityType
    ),
  ];
}
