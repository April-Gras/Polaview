import { Movie, PrismaClient } from "@prisma/client";

import { upsertMovie } from "#/transactionsV2/upsertMovie";

import { getTvDbMovieFomId } from "#/tvdb-api/getTvDbMovieFomId";
import { handleHumans } from "./humans";
import { getCharactersFromEntity } from "./character";

export async function processIdAsMovie(
  prisma: PrismaClient,
  id: number
): Promise<Movie> {
  const tvDbMovie = await getTvDbMovieFomId(id);
  const [cast, writers, directors] = await getCharactersFromEntity(tvDbMovie);
  const allPeoples = [...cast, ...writers, ...directors];

  const [movie] = await prisma.$transaction([
    upsertMovie(prisma, tvDbMovie),
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
