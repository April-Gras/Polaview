import { SerieOverviewTranslation, PrismaClient } from "@prisma/client";

export function upsertAndConnectSerieOverviewTranslations(
  prisma: PrismaClient,
  translations: SerieOverviewTranslation[]
) {
  return translations.map(({ lang, text, serieId }) =>
    prisma.serieOverviewTranslation.upsert({
      where: {
        serieId_lang: {
          lang,
          serieId,
        },
      },
      create: {
        lang,
        text,
        serieV2: {
          connect: {
            id: serieId,
          },
        },
      },
      update: {
        lang,
        text,
      },
    })
  );
}
