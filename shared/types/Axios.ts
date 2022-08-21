import {
  ExtractRouteEntriesByVerb,
  RouteEntry,
  ExtractAvailableUrlsFromCollection,
  GetEntryInCollectionFromUrl,
} from "~/types/Route";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { AllRoutes as ServerRoutes } from "~/types/RouteLibraryServer";
import { AllRoutes as ScrapImdbRoutes } from "~/types/RouteLibraryScrapImdb";

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

export type AxiosGetRequest = BuildAxiosHandler<GetRoutes>;
export type AxiosPostRequest = BuildAxiosHandler<PostRoutes>;
export type AxiosPatchRequest = BuildAxiosHandler<PatchRoutes>;
export type AxiosDeleteRequest = BuildAxiosHandler<DeleteRoutes>;

type ScrapImdbPostRoutes = PrepExpressRoutesToLiveUrls<
  ExtractRouteEntriesByVerb<"post", ScrapImdbRoutes>
>;

type ScrapImdbGetRoutes = PrepExpressRoutesToLiveUrls<
  ExtractRouteEntriesByVerb<"get", ScrapImdbRoutes>
>;

export type AxiosScrapperPostRequest = BuildAxiosHandler<ScrapImdbPostRoutes>;
export type AxiosScrapperGetRequest = BuildAxiosHandler<ScrapImdbGetRoutes>;
