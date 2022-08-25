import { ImdbSearch, Title, Person, Serie, Season, File } from "@prisma/client";
import { BuildRouteEntry, RuntimeConfigBuilder } from "~/types/Route";

import { SearchArguments } from "#/workers/search";

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
  BuildRouteEntry<
    "get",
    "/title/search/:searchTerm",
    { series: Serie[]; titles: Title[] }
  >,
  BuildRouteEntry<"get", "/title/:imdbId", Title>,
  BuildRouteEntry<"get", "/title/:imdbId/cast", Person[]>,
  BuildRouteEntry<"get", "/title/:imdbId/writers", Person[]>,
  BuildRouteEntry<"get", "/title/:imdbId/directors", Person[]>,
  BuildRouteEntry<"get", "/person/:imdbId", Person>,
  // POST
  BuildRouteEntry<
    "post",
    "/search",
    Omit<ImdbSearch, "imdbSearchCacheTerm">[],
    SearchArguments
  >
  // PATCH
  // DELETE
];

export type ScrapImdbRuntimeConfig = RuntimeConfigBuilder<AllRoutes>;
