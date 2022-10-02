import { MovieOverviewTranslation } from "@prisma/client";

import { TvDbMovie } from "~/types/RouteLibraryTvDbApi";

import { tvDbGetRequest } from "#/tvDbApi";
import { availableLocales } from "~/availableLocales";

export async function getTranslations(
  movie: TvDbMovie
): Promise<MovieOverviewTranslation[]> {
  if (!movie.overviewTranslations || !movie.overviewTranslations.length)
    return [];

  const tvDbOverviews = await Promise.all(
    movie.overviewTranslations
      .filter((language) => {
        return availableLocales.includes(language);
      })
      .map((language) =>
        tvDbGetRequest(
          `/movies/${movie.id.toString()}/translations/${language}`
        )
      )
  );

  return tvDbOverviews.reduce(
    (
      accumulator,
      {
        data: {
          data: { language, overview },
        },
      }
    ) => {
      if (overview)
        accumulator.push({ lang: language, movieId: movie.id, text: overview });
      return accumulator;
    },
    [] as MovieOverviewTranslation[]
  );
}
