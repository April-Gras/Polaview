import { ImdbSearch } from "@prisma/client";
import { BuildRouteEntry, RuntimeConfigBuilder } from "~/types/Route";

export type AllRoutes = [
  // GET
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
