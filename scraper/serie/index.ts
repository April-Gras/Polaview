import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryScraper";

export const serieGetSeaons: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/serie/:id/seasons"
> = async (prisma, req) => {
  const { id } = req.params;
  const serie = await prisma.serieV2.findUniqueOrThrow({
    where: {
      id: Number(id),
    },
    include: {
      episodes: true,
      seasons: true,
    },
  });

  return serie;
};
