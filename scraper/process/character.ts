import { TvDbEpisode, TvDbMovie } from "~/types/RouteLibraryTvDbApi";

import { getTvDbPeopleFromIdCollections } from "#/tvdb-api/getTvDbPeopleFromIdCollection";

export function getCharactersFromEntity(entity: TvDbEpisode | TvDbMovie) {
  return Promise.all([
    getTvDbPeopleFromIdCollections(
      (entity.characters || [])
        .filter((char) => ["Actor", "Guest Star"].includes(char.peopleType))
        .map((char) => char.peopleId)
    ),
    getTvDbPeopleFromIdCollections(
      (entity.characters || [])
        .filter((char) => char.peopleType === "Writer")
        .map((char) => char.peopleId)
    ),
    getTvDbPeopleFromIdCollections(
      (entity.characters || [])
        .filter((char) => char.peopleType === "Director")
        .map((char) => char.peopleId)
    ),
  ]);
}
