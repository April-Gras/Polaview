import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryDataLayer";

export const getPeopleById: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/people/:id/"
> = async (prisma, { params: { id } }) => {
  const people = prisma.people.findFirstOrThrow({
    where: {
      id: Number(id),
    },
    include: {
      biography: true,
      episodeOnCast: {
        include: {
          episode: true,
        },
        take: 4,
      },
      episodeOnDirector: {
        include: {
          episode: true,
        },
        take: 4,
      },
      episodeOnWriter: {
        include: {
          episode: true,
        },
        take: 4,
      },
      movieOnCast: {
        include: {
          movie: true,
        },
        take: 4,
      },
      movieOnDirector: {
        include: {
          movie: true,
        },
        take: 4,
      },
      movieOnWriter: {
        include: {
          movie: true,
        },
        take: 4,
      },
    },
  });

  return people;
};
