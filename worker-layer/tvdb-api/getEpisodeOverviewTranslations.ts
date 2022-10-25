import { EpisodeOverviewTranslation } from "@prisma/client";

import { TvDbEpisode } from "~/types/RouteLibraryTvDbApi";

import { tvDbGetRequest } from "~/tvDbApi";
import { availableLocales } from "~/availableLocales";

import { removeEmptyTextOverviewsAndFormat } from "./utils";

export async function getTranslations(
  episode: TvDbEpisode
): Promise<EpisodeOverviewTranslation[]> {
  if (!episode.overviewTranslations || !episode.overviewTranslations.length)
    return [];

  const tvDbOverviews = await Promise.all(
    episode.overviewTranslations
      .filter((language) => {
        return availableLocales.includes(language);
      })
      .map((language) =>
        tvDbGetRequest(
          `/episodes/${episode.id.toString()}/translations/${language}`
        )
      )
  );

  return removeEmptyTextOverviewsAndFormat(
    "episode",
    episode.id,
    tvDbOverviews
  );
}
