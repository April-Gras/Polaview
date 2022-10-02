import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryScraper";

export const cacheGetSearch: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/cache/search/:searchTerm"
> = async (prisma, req, res) => {
  const { searchTerm } = req.params;

  if (!searchTerm || !searchTerm.length) return { series: [], movies: [] };
  const [movies, series] = await Promise.all([
    prisma.movie.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      take: 10,
    }),
    prisma.serieV2.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      take: 10,
    }),
  ]);

  return { series, movies };
};
