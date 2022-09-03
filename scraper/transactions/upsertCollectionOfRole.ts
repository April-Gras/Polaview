import { Prisma, PrismaClient } from "@prisma/client";
import { Collection } from "scraper/workers/saveTitleAndCast";

export function upsertCollectionOfRole(
  prisma: PrismaClient,
  collection: Collection
) {
  return collection.flatMap((entry) => {
    return entry.roleToCastRelation.reduce((accumulator, role) => {
      if (!entry.casts.some((cast) => role.imdbId === cast.imdbId))
        return accumulator;
      accumulator.push(
        prisma.role.upsert({
          where: {
            imdbId: role.imdbId,
          },
          create: {
            imdbId: role.imdbId,
            name: role.name,
            pictureUrl: role.pictureUrl,
            person: {
              connect: {
                imdbId: role.personImdbId,
              },
            },
            title: {
              connect: {
                imdbId: role.titleImdbId,
              },
            },
          },
          update: {},
        })
      );
      return accumulator;
    }, [] as ReturnType<typeof prisma.role.update>[]);
  });
}
