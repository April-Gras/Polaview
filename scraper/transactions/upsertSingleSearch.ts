import { PrismaClient, ImdbSearch } from "@prisma/client";

export function upsertSingleSearch(
  prisma: PrismaClient,
  {
    results,
    term,
  }: {
    results: Omit<ImdbSearch, "imdbSearchCacheTerm">[];
    term: string;
  }
) {
  return prisma.imdbSearchCache.upsert({
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
}
