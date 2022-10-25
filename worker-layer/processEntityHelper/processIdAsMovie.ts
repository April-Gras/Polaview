import { Movie, PrismaClient } from "@prisma/client";

import { upsertMovie } from "#/transactions/upsertMovie";
import { getTvDbMovieFomId } from "#/tvdb-api/getTvDbMovieFomId";
import { getTranslations } from "#/tvdb-api/getMovieOverviewTranslations";

import { handleHumans } from "#/processEntityHelper/handleHumansFromEntity";
import { getCharactersFromEntity } from "#/processEntityHelper/tvDbData/getCharactersFromEntity";
import { upsertAndConnectMovieOverviewTranslations } from "#/transactions/upsertAndConnectMovieOverviewTranslationCollection";

export async function processIdAsMovie(
  prisma: PrismaClient,
  id: number
): Promise<Movie> {
  const tvDbMovie = await getTvDbMovieFomId(id);
  const [[cast, writers, directors], translations] = await Promise.all([
    getCharactersFromEntity(tvDbMovie),
    getTranslations(tvDbMovie),
  ]);
  const allPeoples = [...cast, ...writers, ...directors];

  const [movie] = await prisma.$transaction([
    upsertMovie(prisma, tvDbMovie),
    ...upsertAndConnectMovieOverviewTranslations(prisma, translations),
    ...handleHumans(
      prisma,
      id,
      tvDbMovie,
      allPeoples,
      cast,
      writers,
      directors,
      "movie"
    ),
  ]);

  return movie;
}
