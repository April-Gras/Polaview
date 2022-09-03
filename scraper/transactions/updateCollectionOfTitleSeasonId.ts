import { PrismaClient, Serie, Title } from ".prisma/client";
import { buildSeasonIdFromSerieImdbIdAndIndex } from "~/serie";

export function updateCollectionOfTitleSeasonId(
  prisma: PrismaClient,
  serie: Serie,
  seasonsDescriptors: Title["imdbId"][][]
) {
  return seasonsDescriptors.map((titleImdbIds, seasonIndex) => {
    return prisma.title.updateMany({
      where: {
        imdbId: {
          in: titleImdbIds,
        },
      },
      data: {
        seasonId: {
          set: buildSeasonIdFromSerieImdbIdAndIndex(serie, seasonIndex),
        },
      },
    });
  });
}
