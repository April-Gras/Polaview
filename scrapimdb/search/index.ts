import { spawn, Worker } from "threads";
import { SearchThreadWorker } from "#/workers/search";
import { SaveSearchThreadWorker } from "#/workers/saveSearch";

import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryScrapImdb";

export const searchPost: GetRouteDataHandlerFromUrlAndVerb<
  "post",
  AllRoutes,
  "/search"
> = async (prisma, _, __, { term, typesToCheck, releaseYear }) => {
  if (!term || !term.length) return [];
  const searchCacheEntry = await prisma.imdbSearchCache.findFirst({
    where: {
      term,
    },
  });

  if (searchCacheEntry)
    return await prisma.imdbSearch.findMany({
      where: { imdbSearchCacheTerm: searchCacheEntry.term },
    });

  const searchThread: SearchThreadWorker = await spawn(
    new Worker("../workers/search.ts")
  );
  const saveSearchThread: SaveSearchThreadWorker = await spawn(
    new Worker("../workers/saveSearch.ts")
  );
  const scrapResults = await searchThread({ term, typesToCheck, releaseYear });

  await saveSearchThread({ results: scrapResults, term });
  return scrapResults;
};
