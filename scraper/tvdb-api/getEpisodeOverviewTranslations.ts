import { EpisodeOverviewTranslation } from "@prisma/client";

import { TvDbEpisode } from "~/types/RouteLibraryTvDbApi";

import { tvDbGetRequest } from "#/tvDbApi";
import { availableLocales } from "~/availableLocales";

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
        accumulator.push({
          lang: language,
          episodeId: episode.id,
          text: overview,
        });
      return accumulator;
    },
    [] as EpisodeOverviewTranslation[]
  );
}
