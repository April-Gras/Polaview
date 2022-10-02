import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryScraper";

import { tvDbGetRequest } from "#/tvDbApi";

export const searchV2Post: GetRouteDataHandlerFromUrlAndVerb<
  "post",
  AllRoutes,
  "/searchV2"
> = async (prisma, req, res, payload) => {
  if (!payload.query || !payload.query.length) return [];
  const cached = await prisma.searchCache.findFirst({
    where: {
      term: payload.query,
    },
    select: {
      results: true,
    },
  });

  if (cached) return cached.results;
  const {
    data: { data },
  } = await tvDbGetRequest("/search", {
    ...payload,
    limit: 25,
  });

  const { results } = await prisma.searchCache.create({
    data: {
      term: payload.query,
      results: {
        createMany: {
          data: data.map((result) => ({
            image_url: result.image_url,
            id: result.id,
            name: result.name,
          })),
          skipDuplicates: true,
        },
      },
    },
    select: {
      results: true,
    },
  });

  return results;
};
