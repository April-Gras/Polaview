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

type BuildSingleRouteEntryForClient<ENTRY extends RouteEntry> = [
  ENTRY[0],
  TransformExpressUrl<ENTRY[1]>,
  ENTRY[2],
  ENTRY[3]
];

type PrepExpressRoutesToLiveUrls<
  COLLECTION extends RouteEntry[],
  REST extends RouteEntry[] = []
> = COLLECTION extends [infer ENTRY, ...infer END]
  ? ENTRY extends RouteEntry
    ? END extends RouteEntry[]
      ? [
          BuildSingleRouteEntryForClient<ENTRY>,
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
