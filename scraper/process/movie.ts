import { Movie, PrismaClient } from "@prisma/client";

import { upsertMovie } from "#/transactionsV2/upsertMovie";
import { getTvDbMovieFomId } from "#/tvdb-api/getTvDbMovieFomId";
import { getTranslations } from "#/tvdb-api/getMovieOverviewTranslations";

import { handleHumans } from "./humans";
import { getCharactersFromEntity } from "./character";
import { upsertAndConnectMovieOverviewTranslations } from "#/transactionsV2/upsertAndConnectMovieOverviewTranslationCollection";

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
