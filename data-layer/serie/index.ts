import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryDataLayer";

export const serieGetSeaons: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/serie/:id/seasons"
> = async (prisma, req) => {
  const { id } = req.params;
  return await prisma.serieV2.findUniqueOrThrow({
    where: {
      id: Number(id),
    },
    include: {
      overviews: true,
      seasons: {
        orderBy: {
          number: "asc",
        },
        include: {
          episodes: {
            orderBy: {
              number: "asc",
            },
            include: {
              _count: {
                select: {
                  files: true,
                },
              },
            },
          },
        },
      },
    },
  });
};
