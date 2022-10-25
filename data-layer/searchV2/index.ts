import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryDataLayer";

import { tvDbGetRequest } from "~/tvDbApi";

export const searchV2Post: GetRouteDataHandlerFromUrlAndVerb<
  "post",
  AllRoutes,
  "/searchV2"
> = async (prisma, _req, _res, payload) => {
  if (!payload.query || !payload.query.length) return [];
  const term = payload.query;
  const cachedEntry = (
    await prisma.searchResultOnSearchCache.findMany({
      where: {
        searchCacheTerm: term,
        searchCacheType: payload.type,
      },
      select: {
        searchResult: true,
      },
    })
  ).map((e) => e.searchResult);

  if (cachedEntry.length) return cachedEntry;
  const {
    data: { data: tvDbResults },
  } = await tvDbGetRequest("/search", {
    limit: 25,
    offset: 0,
    query: term,
    type: payload.type,
  });

  if (!tvDbResults.length) return [];
  const [_, ...results] = await prisma.$transaction([
    prisma.searchCache.upsert({
      where: {
        term_type: {
          term,
          type: payload.type,
        },
      },
      create: {
        type: payload.type,
        term,
      },
      update: {
        term,
        type: payload.type,
      },
    }),
    ...tvDbResults.map(({ id, image_url, name }) =>
      prisma.searchResult.upsert({
        where: {
          id,
        },
        create: {
          id,
          image_url,
          name,
        },
        update: {
          id,
          image_url,
          name,
        },
      })
    ),
  ]);
  await prisma.$transaction(
    tvDbResults.map((e) =>
      prisma.searchResultOnSearchCache.create({
        data: {
          searchCacheTerm: term,
          searchResultId: e.id,
          searchCacheType: payload.type,
        },
      })
    )
  );
  return results;
};
