import {
  ImdbSearch,
  Title,
  Person,
  Serie,
  Character,
  People,
  Season,
  File,
  Role,
  FileV2,
  SearchResult,
  Movie,
  Episode,
  SeasonV2,
  SerieV2,
} from "@prisma/client";
import { BuildRouteEntry, RuntimeConfigBuilder } from "~/types/Route";

import { SearchArguments } from "~/types/Search";

export type SeasonSummary = SeasonV2 & { episodes: Episode[] };

export type SerieSummary = SerieV2 & {
  _count: {
    seasons: number;
    episodes: number;
  };
};

export type FileSummary<
  E extends Episode | Movie,
  K extends "episode" | "movie" = E extends Episode ? "episode" : "movie"
> = FileV2 & {
  [KEY in K]:
    | (E & {
        [key in `${K}OnCast`]: {
          people: People;
        }[];
      } & {
        [key in `${K}OnWriter`]: {
          people: People;
        }[];
      } & {
        [key in `${K}OnDirector`]: {
          people: People;
        }[];
      } & {
        characters: Character[];
      })
    | null;
};

export type EpisodeIndexInfo = {
  episodeNumber: number;
  seasonNumber: number;
};

type ProcessEntityPayload<T extends "movie" | "serie" = "movie" | "serie"> = {
  entityId: `${T}-${number}`;
  episodeInfo: T extends "movie" ? undefined : EpisodeIndexInfo;
};

export type AllRoutes = [
  // GET
  BuildRouteEntry<"get", "/latest-movie/", Movie[]>,
  BuildRouteEntry<"get", "/latest-serie/", SerieSummary[]>,
  BuildRouteEntry<"get", "/file/movie/:id/", FileSummary<Movie>>,
  BuildRouteEntry<"get", "/file/episode/:id/", FileSummary<Episode>>,
  BuildRouteEntry<
    "get",
    "/serie/:id/seasons",
    SerieV2 & {
      seasons: SeasonV2[];
      episodes: Episode[];
    }
  >,
  BuildRouteEntry<
    "get",
    "/cache/search/:searchTerm",
    { series: SerieV2[]; movies: Movie[] }
  >,
  // POST
  BuildRouteEntry<
    "post",
    "/searchV2",
    SearchResult[],
    { query: string; type: "movie" | "series" }
  >,
  BuildRouteEntry<
    "post",
    "/processEntity",
    Movie | Episode,
    ProcessEntityPayload
  >
  // PATCH
  // DELETE
];

export type ScraperRuntimeConfig = RuntimeConfigBuilder<AllRoutes>;
