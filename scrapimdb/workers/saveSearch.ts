import { expose } from "threads/worker";
import { PrismaClient, ImdbSearch } from "@prisma/client";

const prisma = new PrismaClient();

export type SaveSearchThreadWorkerReturn = void;
export type SaveSearchThreadWorker = (context: {
  results: Omit<ImdbSearch, "imdbSearchCacheTerm">[];
  term: string;
}) => Promise<SaveSearchThreadWorkerReturn>;

const saveSearchThreadWorker: SaveSearchThreadWorker = async ({
  results,
  term,
}) => {
  try {
    await prisma.imdbSearchCache.create({
      data: {
        term,
        results: {
          create: results,
        },
      },
    });
    return;
  } catch (err) {
    console.log(err);
    return;
  }
};

expose(saveSearchThreadWorker);
