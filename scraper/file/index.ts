import { AllRoutes } from "~/types/RouteLibraryScraper";
import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";

// @ts-expect-error
export const fileGetByMovieId: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/file/movie/:id/"
> = async (prisma, req) => {
  const file = await prisma.fileV2.findFirstOrThrow({
    where: {
      movieId: {
        equals: Number(req.params.id),
      },
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
          overviews: true,
        },
      },
    },
  });

  if (!file.movie) throw new Error(`No movie in file ${file.id}`);
  return file;
};

// @ts-expect-error
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
          overviews: true,
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

  if (!file.episode) throw new Error(`No episode in file ${file.id}`);
  return file;
};
