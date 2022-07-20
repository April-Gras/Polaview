export * from "~/server-index";

import { ExtractRouteEntriesByVerb, RouteEntry } from "~/types/Route";
import { AxiosRequestConfig, AxiosResponse } from "axios";

type GetRoutes = ExtractRouteEntriesByVerb<"get">;
type PostRoutes = ExtractRouteEntriesByVerb<"post">;
type PatchRoutes = ExtractRouteEntriesByVerb<"patch">;
type DeleteRoutes = ExtractRouteEntriesByVerb<"delete">;

type ExtractAvailableUrlsFromCollection<COLLECTION extends RouteEntry[]> =
  COLLECTION[number] extends infer ENTRY
    ? ENTRY extends RouteEntry
      ? ENTRY[1]
      : never
    : never;

type GetEntryInCollectionFromUrl<
  COLLECTION extends RouteEntry[],
  URL = ExtractAvailableUrlsFromCollection<COLLECTION>
> = COLLECTION[number] extends infer ENTRY
  ? ENTRY extends RouteEntry
    ? ENTRY[1] extends URL
      ? ENTRY
      : never
    : never
  : never;

type BuildAxiosHandler<COLLECTION extends RouteEntry[]> = <
  URL extends ExtractAvailableUrlsFromCollection<COLLECTION>,
  ENTRY extends RouteEntry = GetEntryInCollectionFromUrl<COLLECTION, URL>
>(
  url: URL,
  ...args: ENTRY[3] extends undefined
    ? [payload?: undefined, config?: AxiosRequestConfig]
    : [payload: ENTRY[3], config?: AxiosRequestConfig]
) => Promise<AxiosResponse<ENTRY[2]>>;

export type AxiosGetRequest = BuildAxiosHandler<GetRoutes>;
export type AxiosPostRequest = BuildAxiosHandler<PostRoutes>;
export type AxiosPatchRequest = BuildAxiosHandler<PatchRoutes>;
export type AxiosDeleteRequest = BuildAxiosHandler<DeleteRoutes>;
