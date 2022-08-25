import { PrismaClient, Role, Serie } from "@prisma/client";

export function upsertCollectionOfRole(
  prisma: PrismaClient,
  roleToCastRelationCollection: Role[]
) {
  return roleToCastRelationCollection.map(({ name, imdbId, pictureUrl }) => {
    return prisma.role.upsert({
      where: {
        imdbId,
      },
      create: {
        imdbId,
        name,
        pictureUrl,
      },
      update: {
        imdbId,
        name,
        pictureUrl,
      },
    });
  });
}
