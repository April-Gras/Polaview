import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryScrapImdb";

export const latestTitleGet: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/latest-movie/"
> = async (prisma, req, res) => {
  const response = await prisma.file.findMany({
    take: 50,
    orderBy: {
      title: {
        createdOn: "asc",
      },
    },
    where: {
      title: {
        seasonId: null,
      },
    },
    select: {
      title: true,
    },
  });

  return response.map((e) => e.title);
};

export const latestSerieGet: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/latest-serie/"
> = async (prisma) => {
  const results = await prisma.serie.findMany({
    orderBy: {
      createdOn: "asc",
    },
    take: 10,
    select: {
      createdOn: true,
      imdbId: true,
      name: true,
      pictureUrl: true,
      storyline: true,
      _count: {
        select: {
          seasons: true,
        },
      },
      seasons: {
        select: {
          _count: {
            select: {
              episodes: true,
            },
          },
        },
      },
    },
  });

  return results;
};
