import type {
  ExtractRouteEntriesByVerb,
  RouteEntry,
  ExtractAvailableUrlsFromCollection,
  GetEntryInCollectionFromUrl,
} from "~/types/Route";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { AllRoutes as ServerRoutes } from "~/types/RouteLibraryAuthLayer";
import type { AllRoutes as DataLayerRoutes } from "~/types/RouteLibraryDataLayer";
import type { AllRoutes as TvDbApiRoutes } from "~/types/RouteLibraryTvDbApi";

type Primitive = number | string;

type TransformExpressUrl<URL extends string> =
  URL extends `${infer START}/:${infer END}`
    ? END extends `${string}/${infer SEND}`
      ? `${START}/${Primitive}/${TransformExpressUrl<SEND>}`
      : `${START}/${Primitive}`
    : URL;

type BuildSingleRouteEntryForClientSide<ENTRY extends RouteEntry> = [
  ENTRY[0],
  TransformExpressUrl<ENTRY[1]>,
  ENTRY[2],
  ENTRY[3]
];

/**
 * When building routes for the express routerwe end up with templte like routes
 * Like `/foo/:bar` or `/foo/:bar/foobar`
 * These wrk wonders when used with express, but we need to call them client side
 * it just doesn't work anymore.
 *
 * This type aims to resolve this by replacing any occurence of `/:${string}` by
 * `/${Primitive}` <-- note the lack of `:`
 */
type PrepExpressRoutesToLiveUrls<
  COLLECTION extends RouteEntry[],
  REST extends RouteEntry[] = []
> = COLLECTION extends [infer ENTRY, ...infer END]
  ? ENTRY extends RouteEntry
    ? END extends RouteEntry[]
      ? [
          BuildSingleRouteEntryForClientSide<ENTRY>,
          ...PrepExpressRoutesToLiveUrls<END, REST>
        ]
      : REST
    : REST
  : REST;

type GetRoutes = PrepExpressRoutesToLiveUrls<
  ExtractRouteEntriesByVerb<"get", ServerRoutes>
>;
type PostRoutes = PrepExpressRoutesToLiveUrls<
  ExtractRouteEntriesByVerb<"post", ServerRoutes>
>;
type PatchRoutes = PrepExpressRoutesToLiveUrls<
  ExtractRouteEntriesByVerb<"patch", ServerRoutes>
>;
type DeleteRoutes = PrepExpressRoutesToLiveUrls<
  ExtractRouteEntriesByVerb<"delete", ServerRoutes>
>;

/**
 * Takes in a `COLLECTION` of routes,
 * example of those can be found in any route lib file in the project
 * Spits out a function that corresponds to the axios interface for those routes
 */
type BuildAxiosHandler<COLLECTION extends RouteEntry[]> = <
  URL extends TransformExpressUrl<
    ExtractAvailableUrlsFromCollection<COLLECTION>
  >,
  ENTRY extends RouteEntry = GetEntryInCollectionFromUrl<COLLECTION, URL>
>(
  url: URL,
  ...args: ENTRY[3] extends undefined
    ? [payload?: undefined, config?: AxiosRequestConfig]
    : [payload: ENTRY[3], config?: AxiosRequestConfig]
) => Promise<AxiosResponse<ENTRY[2]>>;

// Server Routes
export type AxiosGetRequest = BuildAxiosHandler<GetRoutes>;
export type AxiosPostRequest = BuildAxiosHandler<PostRoutes>;
export type AxiosPatchRequest = BuildAxiosHandler<PatchRoutes>;
export type AxiosDeleteRequest = BuildAxiosHandler<DeleteRoutes>;

// DataLayer Routes
type DataLayerPostRoutes = PrepExpressRoutesToLiveUrls<
  ExtractRouteEntriesByVerb<"post", DataLayerRoutes>
>;

type DataLayerGetRoutes = PrepExpressRoutesToLiveUrls<
  ExtractRouteEntriesByVerb<"get", DataLayerRoutes>
>;

type DataLayerPatchRoutes = PrepExpressRoutesToLiveUrls<
  ExtractRouteEntriesByVerb<"patch", DataLayerRoutes>
>;

export type AxiosDataLayerPostRequest = BuildAxiosHandler<DataLayerPostRoutes>;
export type AxiosDataLayerGetRequest = BuildAxiosHandler<DataLayerGetRoutes>;
export type AxiosDataLayerPatchRequest =
  BuildAxiosHandler<DataLayerPatchRoutes>;

// TvDbApiRoutes
export type AxiosTvDbApiPostRoutes = PrepExpressRoutesToLiveUrls<
  ExtractRouteEntriesByVerb<"post", TvDbApiRoutes>
>;

export type AxiosTvDbApiGetRoutes = PrepExpressRoutesToLiveUrls<
  ExtractRouteEntriesByVerb<"get", TvDbApiRoutes>
>;

export type AxiosTvDbApiPostRequest = BuildAxiosHandler<AxiosTvDbApiPostRoutes>;
export type AxiosTvDbApiGetRequest = BuildAxiosHandler<AxiosTvDbApiGetRoutes>;
