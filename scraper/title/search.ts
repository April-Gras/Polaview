import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryScraper";

export const titleGetSearch: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/title/search/:searchTerm"
> = async (prisma, req, res) => {
  const { searchTerm } = req.params;

  if (!searchTerm || !searchTerm.length) return { series: [], titles: [] };
  const titles = await prisma.title.findMany({
    where: {
      name: {
        contains: searchTerm,
        mode: "insensitive",
      },
      seasonId: null,
    },
    take: 10,
  });
  const series = await prisma.serie.findMany({
    where: {
      name: {
        contains: searchTerm,
        mode: "insensitive",
      },
    },
    take: 10,
  });

  return { series, titles };
};
