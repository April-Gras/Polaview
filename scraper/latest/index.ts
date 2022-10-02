import { Movie } from "@prisma/client";

import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryScraper";

export const latestTitleGet: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/latest-movie/"
> = async (prisma) => {
  const response = await prisma.fileV2.findMany({
    take: 50,
    orderBy: {
      movie: {
        createdOn: "asc",
      },
    },
    where: {
      movie: {
        isNot: null,
      },
    },
    select: {
      movie: true,
    },
  });

  return response.reduce((accumulator, file) => {
    if (file.movie) accumulator.push(file.movie);
    return accumulator;
  }, [] as Movie[]);
};

export const latestSerieGet: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/latest-serie/"
> = async (prisma) => {
  const results = await prisma.serieV2.findMany({
    orderBy: {
      createdOn: "asc",
    },
    take: 10,
    include: {
      _count: {
        select: {
          episodes: true,
          seasons: true,
        },
      },
    },
  });

  return results;
};
