import { MovieOverviewTranslation, PrismaClient } from "@prisma/client";

export function upsertAndConnectMovieOverviewTranslations(
  prisma: PrismaClient,
  translations: MovieOverviewTranslation[]
) {
  return translations.map(({ lang, text, movieId }) =>
    prisma.movieOverviewTranslation.upsert({
      where: {
        movieId_lang: {
          lang,
          movieId,
        },
      },
      create: {
        lang,
        text,
        movie: {
          connect: {
            id: movieId,
          },
        },
      },
      update: {
        lang,
        text,
        movie: {
          connect: {
            id: movieId,
          },
        },
      },
    })
  );
}
