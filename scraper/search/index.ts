import { spawn, Worker } from "threads";
import { SearchThreadWorker } from "scraper/workers/search";
import { SaveSearchThreadWorker } from "scraper/workers/saveSearch";

import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryScraper";

export const searchPost: GetRouteDataHandlerFromUrlAndVerb<
  "post",
  AllRoutes,
  "/search"
> = async (prisma, _, __, { term, typesToCheck, releaseYear }) => {
  if (!term || !term.length) return [];
  const cachedSearches = await prisma.imdbSearch.findMany({
    where: { imdbSearchCacheTerm: term },
  });

  if (cachedSearches.length) return cachedSearches;
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
