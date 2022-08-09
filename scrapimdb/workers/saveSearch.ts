import { expose } from "threads/worker";
import { PrismaClient, ImdbSearch } from "@prisma/client";

export type SaveSearchThreadWorkerReturn = void;
export type SaveSearchThreadWorker = (context: {
  results: Omit<ImdbSearch, "imdbSearchCacheTerm">[];
  term: string;
}) => Promise<SaveSearchThreadWorkerReturn>;

const saveSearchThreadWorker: SaveSearchThreadWorker = async ({
  results,
  term,
}) => {
  const prisma = new PrismaClient();
  try {
    await prisma.imdbSearchCache.upsert({
      where: {
        term,
      },
      create: {
        term,
        results: {
          connectOrCreate: results.map((result) => {
            return {
              create: result,
              where: {
                imdbId: result.imdbId,
              },
            };
          }),
        },
      },
      update: {
        term,
        results: {
          connectOrCreate: results.map((result) => ({
            create: result,
            where: {
              imdbId: result.imdbId,
            },
          })),
        },
      },
    });
    await prisma.$disconnect();
    return;
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return;
  }
};

expose(saveSearchThreadWorker);
