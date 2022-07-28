import { expose } from "threads";
import { Title, Person, PrismaClient, Serie } from "@prisma/client";
import { title } from "process";

export type SaveTitleAndPersonsThreadWorkerResult = void;
export type SaveTitleAndPersonsThreadWorker = (constext: {
  collection: {
    title: Title;
    casts: Person[];
  }[];
  serie?: Serie;
}) => Promise<SaveTitleAndPersonsThreadWorkerResult>;

const prisma = new PrismaClient();

const saveTitleAndPerson: SaveTitleAndPersonsThreadWorker = async ({
  collection,
  serie,
}) => {
  try {
    await prisma.$transaction([
      ...collection.map(({ title }) => {
        return prisma.title.upsert({
          where: {
            imdbId: title.imdbId,
          },
          create: title,
          update: {},
        });
      }),
    ]);
    const allCastMembers = collection.reduce((accumulator, { casts }) => {
      accumulator.push(
        ...casts.filter((cast) => {
          return accumulator.every((e) => e.imdbId !== cast.imdbId);
        })
      );
      return accumulator;
    }, [] as Person[]);

    await prisma.$transaction(
      allCastMembers.map((cast) => {
        return prisma.person.upsert({
          where: {
            imdbId: cast.imdbId,
          },
          create: cast,
          update: {},
        });
      })
    );

    await prisma.$transaction(
      collection.map(({ title, casts }) => {
        return prisma.titleOnCast.createMany({
          data: casts.map((cast) => {
            return {
              personId: cast.imdbId,
              titleId: title.imdbId,
            };
          }),
        });
      })
    );

    if (!serie) return;

    const episodes = {
      connect: collection.map(({ title }) => {
        return {
          imdbId: title.imdbId,
        };
      }),
    };

    await prisma.serie.upsert({
      where: {
        imdbId: serie.imdbId,
      },
      update: {
        episodes,
      },
      create: {
        imdbId: serie.imdbId,
        name: serie.name,
        episodes,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

expose(saveTitleAndPerson);
