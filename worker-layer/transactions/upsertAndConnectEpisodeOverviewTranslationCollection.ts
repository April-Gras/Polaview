import { EpisodeOverviewTranslation, PrismaClient } from "@prisma/client";

export function upsertAndConnectEpisodeOverviewTranslations(
  prisma: PrismaClient,
  translations: EpisodeOverviewTranslation[]
) {
  return translations.map(({ lang, text, episodeId }) =>
    prisma.episodeOverviewTranslation.upsert({
      where: {
        episodeId_lang: {
          lang,
          episodeId,
        },
      },
      create: {
        lang,
        text,
        episode: {
          connect: {
            id: episodeId,
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
