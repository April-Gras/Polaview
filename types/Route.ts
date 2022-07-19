import { User } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const availableVerbs = ["get", "post", "delete", "patch"] as const;

export type JsonCompliantData =
  | Record<string, unknown>
  | string
  | number
  | unknown[];
export type Verb = typeof availableVerbs[number];

type BuildRouteEntry<
  V extends Verb,
  URL extends string,
  RETURN extends JsonCompliantData,
  PAYLOAD extends JsonCompliantData | undefined = undefined
> = [V, URL, RETURN, PAYLOAD];
export type RouteEntry = [
  Verb,
  string,
  JsonCompliantData,
  JsonCompliantData | undefined
];

export type AllRoutes = [
  // GET
  BuildRouteEntry<"get", "/", "health">,
  BuildRouteEntry<"get", "/user/:id", User>,
  // POST
  BuildRouteEntry<"post", "/user", User, User>,
  // PATCH
  BuildRouteEntry<"patch", "/user/:id", User, Partial<Omit<User, "id">>>
];

export type BuildHandlerFromData<
  RETURN extends JsonCompliantData,
  PAYLOAD extends JsonCompliantData | undefined
> = (
  prisma: PrismaClient,
  req: Request,
  res: Response,
  ...args: PAYLOAD extends undefined ? [payload?: PAYLOAD] : [payload: PAYLOAD]
) => Promise<RETURN>;
export type SingleRuntimeConfig<ENTRY extends RouteEntry> = [
  ENTRY[0],
  ENTRY[1],
  BuildHandlerFromData<ENTRY[2], ENTRY[3]>
];

type ExtractRouteEntriesByVerb<
  V extends Verb,
  REST extends RouteEntry[] = [],
  ROUTES extends RouteEntry[] = AllRoutes
> = ROUTES extends [infer ENTRY, ...infer END]
  ? ENTRY extends RouteEntry
    ? END extends RouteEntry[]
      ? ENTRY[0] extends V
        ? ExtractRouteEntriesByVerb<V, [...REST, ENTRY], END>
        : ExtractRouteEntriesByVerb<V, REST, END>
      : REST
    : REST
  : REST;

type GetRoutes = ExtractRouteEntriesByVerb<"get">;
type PostRoutes = ExtractRouteEntriesByVerb<"post">;
type PatchRoutes = ExtractRouteEntriesByVerb<"patch">;
type DeletetRoutes = ExtractRouteEntriesByVerb<"delete">;

type ExtractRouteArgument<
  V extends Verb,
  REST extends RouteEntry[] = [],
  ROUTES extends RouteEntry[] = AllRoutes
> = ROUTES extends [infer ENTRY, ...infer END]
  ? ENTRY extends RouteEntry
    ? END extends RouteEntry[]
      ? ENTRY[0] extends V
        ? ExtractRouteEntriesByVerb<V, [...REST, ENTRY], END>
        : ExtractRouteEntriesByVerb<V, REST, END>
      : REST
    : REST
  : REST;

export type RuntimeConfig<
  REST extends SingleRuntimeConfig<RouteEntry>[] = [],
  ROUTES extends RouteEntry[] = AllRoutes
> = ROUTES extends [infer ENTRY, ...infer END]
  ? ENTRY extends RouteEntry
    ? END extends RouteEntry[]
      ? RuntimeConfig<[...REST, SingleRuntimeConfig<ENTRY>], END>
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
