import {
  ExtractRouteEntriesByVerb,
  RouteEntry,
  ExtractAvailableUrlsFromCollection,
  GetEntryInCollectionFromUrl,
} from "~/types/Route";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { AllRoutes as ServerRoutes } from "~/types/RouteLibraryServer";
import { AllRoutes as ScrapImdbRoutes } from "~/types/RouteLibraryScrapImdb";

type GetRoutes = ExtractRouteEntriesByVerb<"get", ServerRoutes>;
type PostRoutes = ExtractRouteEntriesByVerb<"post", ServerRoutes>;
type PatchRoutes = ExtractRouteEntriesByVerb<"patch", ServerRoutes>;
type DeleteRoutes = ExtractRouteEntriesByVerb<"delete", ServerRoutes>;

type Primitive = number | string;

type TransformExpressUrl<URL extends string> =
  URL extends `${infer START}/:${infer R}` ? `${START}/:${Primitive}` : URL;

type BuildAxiosHandler<COLLECTION extends RouteEntry[]> = <
  URL extends ExtractAvailableUrlsFromCollection<COLLECTION>,
  ENTRY extends RouteEntry = GetEntryInCollectionFromUrl<COLLECTION, URL>
>(
  url: TransformExpressUrl<URL>,
  ...args: ENTRY[3] extends undefined
    ? [payload?: undefined, config?: AxiosRequestConfig]
    : [payload: ENTRY[3], config?: AxiosRequestConfig]
) => Promise<AxiosResponse<ENTRY[2]>>;

export type AxiosGetRequest = BuildAxiosHandler<GetRoutes>;
export type AxiosPostRequest = BuildAxiosHandler<PostRoutes>;
export type AxiosPatchRequest = BuildAxiosHandler<PatchRoutes>;
export type AxiosDeleteRequest = BuildAxiosHandler<DeleteRoutes>;

export type AxiosScrapperPostRequest = BuildAxiosHandler<
  ExtractRouteEntriesByVerb<"post", ScrapImdbRoutes>
>;
export type AxiosScrapperGetRequest = BuildAxiosHandler<
  ExtractRouteEntriesByVerb<"get", ScrapImdbRoutes>
>;
