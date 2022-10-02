import { tvDbGetRequest } from "#/tvDbApi";

import { TvDbMovie } from "~/types/RouteLibraryTvDbApi";

export async function getTvDbMovieFomId(id: number): Promise<TvDbMovie> {
  const {
    data: { data: movie },
  } = await tvDbGetRequest(`/movies/${id.toString()}/extended`);

  return movie;
}
