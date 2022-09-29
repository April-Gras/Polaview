import { TvDbMovie } from "~/types/RouteLibraryTvDbApi";
import { PrismaClient } from "@prisma/client";

export function upsertMovie(
  prisma: PrismaClient,
  { id, name, year, image }: TvDbMovie
) {
  return prisma.movie.upsert({
    where: {
      id,
    },
    create: {
      id,
      image: image || undefined,
      name,
      year: Number(year),
    },
    update: {
      image: image || undefined,
      name,
      year: Number(year),
    },
  });
}
