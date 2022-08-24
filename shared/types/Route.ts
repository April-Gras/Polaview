import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const availableVerbs = ["get", "post", "delete", "patch"] as const;

/**
 * To standardize the type of data returned by our routes, we limit them to
 * different varation of primitives
 *
 * You can expect any typed endpoint to return a payload extending this type
 */
export type JsonCompliantData =
  | Record<string, unknown>
  | string
  | number
  | boolean
  | unknown[];
export type Verb = typeof availableVerbs[number];

/**
 * Used to build a route entry
 * Those entries are then used to enforce types down the line when writting
 * backend endpoints or using them client side
 *
 * Note that the type returned by this builder is just an intermediary step in
 * the type system.
 */
export type BuildRouteEntry<
  V extends Verb,
  URL extends string,
  RETURN extends JsonCompliantData,
  PAYLOAD extends Record<string, unknown> | unknown[] | undefined = undefined
> = [V, URL, RETURN, PAYLOAD];

/**
 * The standard definition of a RouteEntry.
 * Just a flat array of the info needed to define one endpoint.
 */
export type RouteEntry = [
  Verb,
  string,
  JsonCompliantData,
  JsonCompliantData | undefined
];

/**
 * Takes in a RouteEntry and Builds the expected handler associated with the info
 * found in it.
 */
export type BuildHandlerFromData<
  RETURN extends JsonCompliantData,
  PAYLOAD extends JsonCompliantData | undefined
> = (
  prisma: PrismaClient,
  req: Request,
  res: Response,
  payload: PAYLOAD
) => Promise<RETURN>;

/**
 * Single configuration holding types for the endpoint libraries.
 */
export type SingleRuntimeConfig<ENTRY extends RouteEntry> = [
  ENTRY[0],
  ENTRY[1],
  BuildHandlerFromData<ENTRY[2], ENTRY[3]>
];

/**
 * @param { Verb } V - The verb to filter by.
 * @param { RouteEntry[] } COLLECTION - The route collection, defined in the type library files.
 * @param { RouteEntry[] } REST - ! used internally.
 *
 * @returns { never | RouteEntry } An union of the route entries that share the same verb as `V` or never if none could be found.
 */
export type ExtractRouteEntriesByVerb<
  V extends Verb,
  COLLECTION extends RouteEntry[],
  REST extends RouteEntry[] = []
> = COLLECTION extends [infer ENTRY, ...infer END]
  ? ENTRY extends RouteEntry
    ? END extends RouteEntry[]
      ? ENTRY[0] extends V
        ? ExtractRouteEntriesByVerb<V, END, [...REST, ENTRY]>
        : ExtractRouteEntriesByVerb<V, END, REST>
      : REST
    : REST
  : REST;

/**
 * Used to provide the type of the runtime endpoint library.
 */
export type RuntimeConfigBuilder<
  ROUTES extends RouteEntry[] = [],
  REST extends SingleRuntimeConfig<RouteEntry>[] = []
> = ROUTES extends [infer ENTRY, ...infer END]
  ? ENTRY extends RouteEntry
    ? END extends RouteEntry[]
      ? RuntimeConfigBuilder<END, [...REST, SingleRuntimeConfig<ENTRY>]>
      : REST
    : REST
  : REST;

/**
 * @param { Verb } V - The verb to filter by.
 * @param { RouteEntry[] } COLLECTION - The route collection, defined in the type library files.
 *
 * @returns { string } an union of all possible urls in the collection filtered by the supplied `Verb` `V`.
 */
export type AvailableUrlsFromVerb<
  V extends Verb,
  COLLECTION extends RouteEntry[]
> = COLLECTION[number] extends infer ENTRY
  ? ENTRY extends RouteEntry
    ? ENTRY[0] extends V
      ? ENTRY[1]
      : never
    : never
  : never;

/**
 * Simimar to the `AvailableUrlsFromVerb` type but it won't take in any Verb filter.
 *
 * @param { RouteEntry[] } COLLECTION - The route collection, defined in the type library files.
 * @returns { string } an union of all possible urls in the collection.
 */
export type ExtractAvailableUrlsFromCollection<
  COLLECTION extends RouteEntry[]
> = COLLECTION[number] extends infer ENTRY
  ? ENTRY extends RouteEntry
    ? ENTRY[1]
    : never
  : never;

/**
 * Will return the expected handler for a given verb / url combination or never if none where found.
 *
 * @param { Verb } V - The verb to filter by.
 * @param { RouteEntry[] } COLLECTION - The route collection, defined in the type library files.
 * @param { string } URL - The URL to filter by.
 *
 * @returns { (prisma: PrismaClient, req: Request, res: Response, payload: JsonCompliantData) => Promise<JsonCompliantData> } the expected express handler for a given Verb - Url combination, or never if none where found
 */
export type GetRouteDataHandlerFromUrlAndVerb<
  V extends Verb,
  COLLECTION extends RouteEntry[],
  URL extends AvailableUrlsFromVerb<V, COLLECTION>
> = COLLECTION[number] extends infer ENTRY
  ? ENTRY extends RouteEntry
    ? ENTRY[0] extends V
      ? ENTRY[1] extends URL
        ? BuildHandlerFromData<ENTRY[2], ENTRY[3]>
        : never
      : never
    : never
  : never;

/**
 * Will return the expected `RouteEntry` for a given verb / url combination or never if none where found.
 *
 * @param { Verb } V - The verb to filter by.
 * @param { RouteEntry[] } COLLECTION - The route collection, defined in the type library files.
 * @param { string } URL - The URL to filter by.
 *
 * @returns { RouteEntry | never } the expected `RouteEntry` for a given Verb - Url combination, or never if none where found.
 */
export type GetEntryInCollectionFromUrl<
  COLLECTION extends RouteEntry[],
  URL = ExtractAvailableUrlsFromCollection<COLLECTION>
> = COLLECTION extends [infer ENTRY, ...infer END]
  ? ENTRY extends RouteEntry
    ? ENTRY[1] extends URL
      ? ENTRY
      : END extends RouteEntry[]
      ? GetEntryInCollectionFromUrl<END, URL>
      : never
    : never
  : never;
