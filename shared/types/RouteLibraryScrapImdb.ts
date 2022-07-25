import { ImdbSearch, Title, Person } from "@prisma/client";
import { BuildRouteEntry, RuntimeConfigBuilder } from "~/types/Route";

export type AllRoutes = [
  // GET
  BuildRouteEntry<"get", "/movie/:imdbId", Title>,
  BuildRouteEntry<"get", "/movie/:imdbId/cast", Person[]>,
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
