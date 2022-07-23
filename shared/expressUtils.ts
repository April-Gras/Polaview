import { Request } from "express";
import { ExpressMiddleware } from "./types/ExpressMiddleware";
import {
  Verb,
  JsonCompliantData,
  BuildHandlerFromData,
  SingleRuntimeConfig,
  AvailableUrlsFromVerb,
  RouteEntry,
} from "~/types/Route";

export function buildSingleRuntimeConfigEntry<
  V extends Verb,
  URL extends string,
  RETURN extends JsonCompliantData,
  PAYLOAD extends JsonCompliantData | undefined
>(
  verb: V,
  url: URL,
  fn: BuildHandlerFromData<RETURN, PAYLOAD>
): SingleRuntimeConfig<[V, URL, RETURN, PAYLOAD]> {
  return [verb, url, fn];
}

export function buildSingleMiddleware<
  COLLECTION extends RouteEntry[],
  V extends Verb,
  URL = AvailableUrlsFromVerb<V, COLLECTION>[number]
>(verb: V, url: URL, handler: ExpressMiddleware): [V, URL, ExpressMiddleware] {
  return [verb, url, handler];
}

export function getSessionIdFromRequest(req: Request): string | null {
  const { sessionid } = req.cookies;

  if (!sessionid || !sessionid.length) return null;
  return sessionid;
}
