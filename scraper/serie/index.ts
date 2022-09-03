import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryScraper";

export const serieGet: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/serie/:imdbId"
> = async (prisma, req) => {
  const { imdbId } = req.params;

  return await prisma.serie.findFirstOrThrow({
    where: {
      imdbId: imdbId,
    },
    select: {
      createdOn: true,
      imdbId: true,
      name: true,
      pictureUrl: true,
      storyline: true,
      seasons: {
        select: {
          id: true,
          serieImdbId: true,
          episodes: true,
        },
      },
    },
  });
};

export const serieGetSeaons: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/serie/:imdbId/seasons"
> = async (prisma, req) => {
  const { imdbId } = req.params;
  const serie = await prisma.serie.findUniqueOrThrow({
    where: {
      imdbId,
    },
    include: {
      seasons: {
        include: {
          episodes: true,
        },
      },
    },
  });

  return {
    seasons: serie.seasons,
    serie: {
      createdOn: serie.createdOn,
      imdbId: serie.imdbId,
      name: serie.name,
      pictureUrl: serie.pictureUrl,
      storyline: serie.storyline,
    },
  };
};
