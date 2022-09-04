import { AllRoutes } from "~/types/RouteLibraryScraper";
import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";

export const fileGetByTitleImdbId: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/file/titleImdbId/:imdbId"
> = async (prisma, req) => {
  return await prisma.file.findFirstOrThrow({
    where: {
      titleImdbId: req.params.imdbId,
    },
  });
};
