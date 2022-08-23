import { PrismaClient, Serie } from "@prisma/client";

export function upsertSingleSerie(prisma: PrismaClient, serie: Serie) {
  return prisma.serie.upsert({
    where: {
      imdbId: serie.imdbId,
    },
    create: serie,
    update: {},
  });
}
