import { ImdbSearch, Title, Person, Serie } from "@prisma/client";
import { BuildRouteEntry, RuntimeConfigBuilder } from "~/types/Route";

export type AllRoutes = [
  // GET
  BuildRouteEntry<"get", "/serie/:imdbId", Serie>,
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
