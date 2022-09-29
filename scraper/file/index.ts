import { AllRoutes } from "~/types/RouteLibraryScraper";
import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";

export const fileGetByMovieId: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/file/movie/:id/"
> = async (prisma, req) => {
  return await prisma.fileV2.findFirstOrThrow({
    where: {
      movieId: Number(req.params.id),
    },
    include: {
      movie: {
        include: {
          characters: true,
          movieOnCast: {
            select: {
              people: true,
            },
          },
          movieOnWriter: {
            select: {
              people: true,
            },
          },
          movieOnDirector: {
            select: {
              people: true,
            },
          },
        },
      },
    },
  });
};

export const fileGetByEpisodeId: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/file/episode/:id/"
> = async (prisma, req) => {
  const file = await prisma.fileV2.findFirstOrThrow({
    where: {
      episodeId: Number(req.params.id),
    },
    include: {
      episode: {
        include: {
          characters: true,
          episodeOnCast: {
            select: {
              people: true,
            },
          },
          episodeOnWriter: {
            select: {
              people: true,
            },
          },
          episodeOnDirector: {
            select: {
              people: true,
            },
          },
        },
      },
    },
  });

  return file;
};
