import { expose } from "threads";
import { Title, Person, PrismaClient, Serie, Role } from "@prisma/client";

import { updateCollectionOfTitleSeasonId } from "#/transactions/updateCollectionOfTitleSeasonId";
import { upsertCollectionOfPerson } from "#/transactions/upsertCollectionOfPerson";
import { upsertCollectionOfRole } from "#/transactions/upsertCollectionOfRole";
import { upsertCollectionOfSeason } from "#/transactions/upsertCollectionOfSeason";
import { upsertCollectionOfTitle } from "#/transactions/upsertCollectionOfTitle";
import { upsertCollectionOfTitleOnPersonObject } from "#/transactions/upsertCollectionOfTitleOnCast";
import { upsertSingleSerie } from "#/transactions/upsertSingleSerie";

export type SaveTitleAndPersonsThreadWorkerResult = void;
export type Collection = {
  title: Title;
  casts: Person[];
  writers: Person[];
  directors: Person[];
  roleToCastRelation: Role[];
}[];
export type SaveTitleAndPersonsThreadWorker = (context: {
  collection: Collection;
  serie?: Serie;
  seasonsDescriptors?: Title["imdbId"][][];
}) => Promise<SaveTitleAndPersonsThreadWorkerResult>;

function getPersonsTypeInCollection(
  collection: Collection,
  personType: "casts" | "writers" | "directors",
  baseAccumulator: Person[] = []
) {
  return collection.reduce((accumulator, entry) => {
    accumulator.push(
      ...entry[personType].filter((person) => {
        return accumulator.every((e) => e.imdbId !== person.imdbId);
      })
    );
    return accumulator;
  }, baseAccumulator);
}

const saveTitleAndPerson: SaveTitleAndPersonsThreadWorker = async ({
  collection,
  serie,
  seasonsDescriptors,
}) => {
  const prisma = new PrismaClient();
  try {
    const allCastMembers = getPersonsTypeInCollection(collection, "casts");
    const allWriters = getPersonsTypeInCollection(collection, "writers");
    const allDirectors = getPersonsTypeInCollection(collection, "directors");

    await prisma.$transaction([
      ...upsertCollectionOfTitle(
        prisma,
        collection.map(({ title }) => title)
      ),
      ...upsertCollectionOfPerson(prisma, [
        ...allWriters,
        ...allDirectors,
        ...allCastMembers,
      ]),
      ...collection.flatMap(({ title, casts, writers, directors }) => {
        return upsertCollectionOfTitleOnPersonObject(
          prisma,
          title,
          casts,
          "titleOnCast"
        );
      }),
      ...collection.flatMap(({ title, writers }) => {
        return upsertCollectionOfTitleOnPersonObject(
          prisma,
          title,
          writers,
          "titleOnWriter"
        );
      }),
      ...collection.flatMap(({ title, directors }) => {
        return upsertCollectionOfTitleOnPersonObject(
          prisma,
          title,
          directors,
          "titleOnDirector"
        );
      }),
      ...upsertCollectionOfRole(prisma, collection),
      // If we got a series add it to the transaction
      ...(serie && seasonsDescriptors
        ? [
            upsertSingleSerie(prisma, serie),
            ...upsertCollectionOfSeason(prisma, serie, seasonsDescriptors),
            ...updateCollectionOfTitleSeasonId(
              prisma,
              serie,
              seasonsDescriptors
            ),
          ]
        : []),
    ]);
    await prisma.$disconnect();
  } catch (err) {
    await prisma.$disconnect();
    console.log(err);
  }
};

expose(saveTitleAndPerson);
