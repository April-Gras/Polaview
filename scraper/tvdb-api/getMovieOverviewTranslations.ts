import { MovieOverviewTranslation } from "@prisma/client";

import { TvDbMovie } from "~/types/RouteLibraryTvDbApi";

import { tvDbGetRequest } from "#/tvDbApi";
import { availableLocales } from "~/availableLocales";

import { removeEmptyTextOverviewsAndFormat } from "./utils";

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

  return removeEmptyTextOverviewsAndFormat("movie", movie.id, tvDbOverviews);
}
