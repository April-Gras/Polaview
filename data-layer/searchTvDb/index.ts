import type { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import type { AllRoutes } from "~/types/RouteLibraryDataLayer";

import type { Movie, SerieV2 } from "@prisma/client";
import { tvDbGetRequest } from "~/tvDbApi";

function searchRecordIsValid<T extends "movie" | "series">(
  record: any,
  foundEntityType: T
): record is T extends "movie" ? { movie: Movie } : { series: SerieV2 } {
  return (
    !!record[foundEntityType] && ["series", "movie"].includes(foundEntityType)
  );
}

export const searchTvDb: GetRouteDataHandlerFromUrlAndVerb<
  "post",
  AllRoutes,
  "/searchTvDb"
> = async (prisma, _req, _res, payload) => {
  const { remoteId } = payload ?? {};
  if (!payload.remoteId || !payload.remoteId.length) throw "Bad request";
  const {
    data: { data: searchRecordArray },
  } = await tvDbGetRequest(`/search/remoteid/${remoteId}`);

  const searchRecord = searchRecordArray[0];
  if (!searchRecord) throw "no result for this remote id";
  const foundEntityType = Object.keys(searchRecord)[0] as "series" | "movie";
  const entity = searchRecord[foundEntityType];
  if (!entity) throw "missing searched entity";
  const term = `${foundEntityType}-${remoteId}`;
  const [, result] = await prisma.$transaction([
    prisma.searchCache.upsert({
      where: {
        term_type: {
          term,
          type: foundEntityType,
        },
      },
      create: {
        type: foundEntityType,
        term,
      },
      update: {
        term,
        type: foundEntityType,
      },
    }),
    prisma.searchResult.upsert({
      where: {
        id: `${foundEntityType}-${entity.id}`,
      },
      create: {
        id: `${foundEntityType}-${entity.id}`,
        image_url: entity.image,
        name: entity.name,
      },
      update: {
        id: `${foundEntityType}-${entity.id}`,
        image_url: entity.image,
        name: entity.name,
      },
    }),
  ]);
  await prisma.searchResultOnSearchCache.upsert({
    where: {
      searchCacheTerm_searchResultId: {
        searchCacheTerm: term,
        searchResultId: result.id,
      },
    },
    create: {
      searchCacheTerm: term,
      searchResultId: result.id,
      searchCacheType: foundEntityType,
    },
    update: {
      searchCacheTerm: term,
      searchResultId: result.id,
      searchCacheType: foundEntityType,
    },
  });
  return result;
};
