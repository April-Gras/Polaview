import { SerieOverviewTranslation } from "@prisma/client";

import { TvDbSerie } from "~/types/RouteLibraryTvDbApi";

import { tvDbGetRequest } from "~/tvDbApi";

import { removeEmptyTextOverviewsAndFormat } from "./utils";

import { availableLocales } from "~/availableLocales";

export async function getTranslations(
  serie: TvDbSerie
): Promise<SerieOverviewTranslation[]> {
  if (!serie.overviewTranslations || !serie.overviewTranslations.length)
    return [];

  const tvDbOverviews = await Promise.all(
    serie.overviewTranslations
      .filter((language) => {
        return availableLocales.includes(language);
      })
      .map((language) =>
        tvDbGetRequest(
          `/series/${serie.id.toString()}/translations/${language}`
        )
      )
  );

  return removeEmptyTextOverviewsAndFormat("serie", serie.id, tvDbOverviews);
}
