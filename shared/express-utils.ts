import {
  Verb,
  JsonCompliantData,
  BuildHandlerFromData,
  SingleRuntimeConfig,
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
