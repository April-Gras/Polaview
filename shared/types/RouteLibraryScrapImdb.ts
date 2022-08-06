import { ImdbSearch, Title, Person, Serie, Season } from "@prisma/client";
import { BuildRouteEntry, RuntimeConfigBuilder } from "~/types/Route";

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
  // BuildRouteEntry<"get", "/title/mostWatched/", Title[]>,
  BuildRouteEntry<"get", "/latest-serie/", SerieSummary[]>,
  // BuildRouteEntry<"get", "/series/mostWatched/", Title[]>,
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
    (Season & { serie: Serie; episodes: Title[] })[]
  >,
  BuildRouteEntry<"get", "/title/:imdbId", Title>,
  BuildRouteEntry<"get", "/title/:imdbId/cast", Person[]>,
  BuildRouteEntry<"get", "/person/:imdbId", Person>,
  // POST
  BuildRouteEntry<
    "post",
    "/search",
    Omit<ImdbSearch, "imdbSearchCacheTerm">[],
    { term: string }
  >
  // PATCH
  // DELETE
];

export type ScrapImdbRuntimeConfig = RuntimeConfigBuilder<AllRoutes>;
