import {
  ImdbSearch,
  Title,
  Person,
  Serie,
  Season,
  File,
  Role,
  SearchResult,
  Movie,
  Episode,
} from "@prisma/client";
import { BuildRouteEntry, RuntimeConfigBuilder } from "~/types/Route";

import { SearchArguments } from "~/types/Search";

export type SeasonSummary = Season & { episodes: Title[] };

export type SerieSummary = Serie & {
  seasons: {
    _count: {
      episodes: number;
    };
  }[];
  _count: {
    seasons: number;
  };
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
  BuildRouteEntry<"get", "/latest-movie/", Title[]>,
  BuildRouteEntry<"get", "/latest-serie/", SerieSummary[]>,
  BuildRouteEntry<"get", "/file/titleImdbId/:imdbId", File>,
  BuildRouteEntry<
    "get",
    "/serie/:imdbId",
    Serie & {
      seasons: {
        id: string;
        serieImdbId: string;
        episodes: Title[];
      }[];
    }
  >,
  BuildRouteEntry<
    "get",
    "/serie/:imdbId/seasons",
    { serie: Serie; seasons: SeasonSummary[] }
  >,
  BuildRouteEntry<"get", "/title/:imdbId", Title>,
  BuildRouteEntry<"get", "/title/:imdbId/cast", Person[]>,
  BuildRouteEntry<"get", "/title/:imdbId/writers", Person[]>,
  BuildRouteEntry<"get", "/title/:imdbId/directors", Person[]>,
  BuildRouteEntry<"get", "/title/:imdbId/roles", Role[]>,
  BuildRouteEntry<"get", "/person/:imdbId", Person>,
  BuildRouteEntry<
    "get",
    "/title/search/:searchTerm",
    { series: Serie[]; titles: Title[] }
  >,
  // POST
  BuildRouteEntry<
    "post",
    "/search",
    Omit<ImdbSearch, "imdbSearchCacheTerm">[],
    SearchArguments
  >,
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
