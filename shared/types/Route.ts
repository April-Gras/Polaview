import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { AllRoutes } from "~/types/RouteLibraryServer";
const availableVerbs = ["get", "post", "delete", "patch"] as const;

export type JsonCompliantData =
  | Record<string, unknown>
  | string
  | number
  | boolean
  | unknown[];
export type Verb = typeof availableVerbs[number];

export type BuildRouteEntry<
  V extends Verb,
  URL extends string,
  RETURN extends JsonCompliantData,
  PAYLOAD extends Record<string, unknown> | unknown[] | undefined = undefined
> = [V, URL, RETURN, PAYLOAD];
export type RouteEntry = [
  Verb,
  string,
  JsonCompliantData,
  JsonCompliantData | undefined
];

export type BuildHandlerFromData<
  RETURN extends JsonCompliantData,
  PAYLOAD extends JsonCompliantData | undefined
> = (
  prisma: PrismaClient,
  req: Request,
  res: Response,
  payload: PAYLOAD
) => Promise<RETURN>;

export type SingleRuntimeConfig<ENTRY extends RouteEntry> = [
  ENTRY[0],
  ENTRY[1],
  BuildHandlerFromData<ENTRY[2], ENTRY[3]>
];

export type ExtractRouteEntriesByVerb<
  V extends Verb,
  REST extends RouteEntry[] = [],
  ROUTES extends RouteEntry[] = []
> = ROUTES extends [infer ENTRY, ...infer END]
  ? ENTRY extends RouteEntry
    ? END extends RouteEntry[]
      ? ENTRY[0] extends V
        ? ExtractRouteEntriesByVerb<V, [...REST, ENTRY], END>
        : ExtractRouteEntriesByVerb<V, REST, END>
      : REST
    : REST
  : REST;

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

export type AvailableUrlsFromVerb<V extends Verb> =
  AllRoutes[number] extends infer ENTRY
    ? ENTRY extends RouteEntry
      ? ENTRY[0] extends V
        ? ENTRY[1]
        : never
      : never
    : never;

export type GetRouteDataHandlerFromUrlAndVerb<
  V extends Verb,
  URL extends AvailableUrlsFromVerb<V>
> = AllRoutes[number] extends infer ENTRY
  ? ENTRY extends RouteEntry
    ? ENTRY[0] extends V
      ? ENTRY[1] extends URL
        ? BuildHandlerFromData<ENTRY[2], ENTRY[3]>
        : never
      : never
    : never
  : never;
