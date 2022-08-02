import { expose } from "threads";
import { Title, Person, PrismaClient, Serie } from "@prisma/client";
import { buildSeasonIdFromSerieImdbIdAndIndex } from "~/serie";

export type SaveTitleAndPersonsThreadWorkerResult = void;
export type SaveTitleAndPersonsThreadWorker = (constext: {
  collection: {
    title: Title;
    casts: Person[];
  }[];
  serie?: Serie;
  seasonsDescriptors?: Title["imdbId"][][];
}) => Promise<SaveTitleAndPersonsThreadWorkerResult>;

const prisma = new PrismaClient();

const saveTitleAndPerson: SaveTitleAndPersonsThreadWorker = async ({
  collection,
  serie,
  seasonsDescriptors,
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

    for (const { title, casts } of collection) {
      prisma.$transaction(
        casts.map((cast) => {
          return prisma.titleOnCast.upsert({
            where: {
              titleId_personId: {
                personId: cast.imdbId,
                titleId: title.imdbId,
              },
            },
            create: {
              person: {
                connect: {
                  imdbId: cast.imdbId,
                },
              },
              title: {
                connect: {
                  imdbId: title.imdbId,
                },
              },
            },
            // Don't update shit since this connection already exists
            update: {},
          });
        })
      );
    }

    if (!serie) return;
    if (!seasonsDescriptors) return;

    // Upsert serie
    await prisma.serie.upsert({
      where: {
        imdbId: serie.imdbId,
      },
      create: serie,
      update: {},
    });

    // For every season upsert
    const seasons = await prisma.$transaction(
      seasonsDescriptors.map((season, index) => {
        const id = buildSeasonIdFromSerieImdbIdAndIndex(serie, index);
        return prisma.season.upsert({
          where: {
            id,
          },
          create: {
            id,
            serie: {
              connect: {
                imdbId: serie.imdbId,
              },
            },
          },
          update: {
            serie: {
              connect: {
                imdbId: serie.imdbId,
              },
            },
          },
        });
      })
    );

    await prisma.$transaction(
      seasonsDescriptors.map((titleImdbIds, seasonIndex) => {
        return prisma.title.updateMany({
          where: {
            imdbId: {
              in: titleImdbIds,
            },
          },
          data: {
            seasonId: {
              set: buildSeasonIdFromSerieImdbIdAndIndex(serie, seasonIndex),
            },
          },
        });
      })
    );
  } catch (err) {
    console.log(err);
  }
};

expose(saveTitleAndPerson);
