import { tvDbGetRequest } from "#/tvDbApi";

import { TvDbPeople } from "~/types/RouteLibraryTvDbApi";

export async function getTvDbPeopleFromIdCollections(idSet: number[]) {
  const responses = await Promise.allSettled(
    idSet.map((id) => tvDbGetRequest(`/people/${id.toString()}/extended`))
  );

  return responses.reduce((accumulator, promise) => {
    if (promise.status === "fulfilled" && promise.value)
      accumulator.push(promise.value.data.data);
    return accumulator;
  }, [] as TvDbPeople[]);
}
