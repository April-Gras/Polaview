import { Serie, PrismaClient, Title } from "@prisma/client";
import { buildSeasonIdFromSerieImdbIdAndIndex } from "~/serie";

export function upsertCollectionOfSeason(
  prisma: PrismaClient,
  serie: Serie,
  seasonDescriptors: Title["imdbId"][][]
) {
  return seasonDescriptors.map((_, index) => {
    const id = buildSeasonIdFromSerieImdbIdAndIndex(serie, index);
    return prisma.season.upsert({
      where: {
        id,
      },
      create: {
        id,
        serie: {
          connect: {
            imdbId: serie.imdbId,
          },
        },
      },
      update: {
        serie: {
          connect: {
            imdbId: serie.imdbId,
          },
        },
      },
    });
  });
}
