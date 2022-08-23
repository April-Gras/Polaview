import { expose } from "threads";
import { Title, Person, PrismaClient, Serie } from "@prisma/client";

import { upsertCollectionOfTitle } from "#/transactions/upsertCollectionOfTitle";
import { upsertCollectionOfPerson } from "#/transactions/upsertCollectionOfPerson";
import { upsertCollectionOfTitleOnPersonObject } from "#/transactions/upsertCollectionOfTitleOnCast";
import { upsertSingleSerie } from "#/transactions/upsertSingleSerie";
import { upsertCollectionOfSeason } from "#/transactions/upsertCollectionOfSeason";
import { updateCollectionOfTitleSeasonId } from "#/transactions/updateCollectionOfTitleSeasonId";

export type SaveTitleAndPersonsThreadWorkerResult = void;
type Collection = {
  title: Title;
  casts: Person[];
  writers: Person[];
  directors: Person[];
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
      ...collection
        .map(({ title, casts, writers, directors }) => {
          return upsertCollectionOfTitleOnPersonObject(
            prisma,
            title,
            casts,
            "titleOnCast"
          );
        })
        .flat(),
      ...collection
        .map(({ title, writers }) => {
          return upsertCollectionOfTitleOnPersonObject(
            prisma,
            title,
            writers,
            "titleOnWriter"
          );
        })
        .flat(),
      ...collection
        .map(({ title, directors }) => {
          return upsertCollectionOfTitleOnPersonObject(
            prisma,
            title,
            directors,
            "titleOnDirector"
          );
        })
        .flat(),
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
