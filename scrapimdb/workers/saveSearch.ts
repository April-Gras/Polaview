import { expose } from "threads/worker";
import { PrismaClient, ImdbSearch } from "@prisma/client";

import { upsertSingleSearch } from "#/transactions/upsertSingleSearch";

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
    await upsertSingleSearch(prisma, { results, term });
    await prisma.$disconnect();
    return;
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return;
  }
};

expose(saveSearchThreadWorker);
