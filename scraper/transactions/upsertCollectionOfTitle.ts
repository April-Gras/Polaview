import { Title, PrismaClient } from "@prisma/client";

export function upsertCollectionOfTitle(prisma: PrismaClient, titles: Title[]) {
  return titles.map((title) => {
    return prisma.title.upsert({
      where: {
        imdbId: title.imdbId,
      },
      create: title,
      update: {},
    });
  });
}
