import {
  SerieOverviewTranslation,
  MovieOverviewTranslation,
  EpisodeOverviewTranslation,
} from "@prisma/client";
import { AxiosResponse } from "axios";
import {
  DefaultTvDbResponse,
  TvDbOverviewTranslation,
} from "~/types/RouteLibraryTvDbApi";

type ConvertorTarget<T extends "episode" | "movie" | "serie"> =
  T extends "movie"
    ? MovieOverviewTranslation
    : T extends "episode"
    ? EpisodeOverviewTranslation
    : T extends "serie"
    ? SerieOverviewTranslation
    : never;

export function removeEmptyTextOverviewsAndFormat<
  T extends "episode" | "movie" | "serie"
>(
  type: T,
  entityId: number,
  overviewResponses: AxiosResponse<
    DefaultTvDbResponse<TvDbOverviewTranslation>
  >[]
): ConvertorTarget<T>[] {
  return overviewResponses.reduce(
    (
      accumulator,
      {
        data: {
          data: { language, overview },
        },
      }
    ) => {
      if (overview) {
        const idKey = `${type}Id` as const;

        accumulator.push({
          lang: language,
          text: overview,
          [idKey]: entityId,
        } as ConvertorTarget<T>);
      }
      return accumulator;
    },
    [] as ConvertorTarget<T>[]
  );
}
