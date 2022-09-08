import { Movie } from ".prisma/client";
import { BuildRouteEntry } from "./Route";

type DefaultTvDbRespionse<T> = {
  status: string;
  data: T;
};

type TvDbSearchResult = {
  id: `movie-${string}` | `serie-${string}`;
  image_url: string;
  name: string;
  [key: string]: any;
};

type TvDbCharacter = {
  id: number;
  image: string;
  name: string;
  peopleId: number;
  peopleType: "Actor" | "Writer" | "Director" | string;
};

export type TvDbMovie = {
  id: number;
  characters: TvDbCharacter[];
  image: string;
  name: string;
  lists: any[]; //TODO List feature
  year: string;
};

export type TvDbSerie = {
  averageRuntime: number;
  id: number;
  image: string;
  name: string;
  seasons: { id: number }[];
  year: string;
};

type TvDbBiography = {
  biography: string;
  language: string;
};

export type TvDbPeople = {
  biographies: TvDbBiography[] | null;
  birth?: string;
  birthPlace?: string;
  death?: string;
  id: number;
  name: string;
};

export type AllRoutes = [
  // Get
  BuildRouteEntry<
    "get",
    "/movies/:id/extended",
    DefaultTvDbRespionse<TvDbMovie>
  >,
  BuildRouteEntry<
    "get",
    "/series/:id/extended",
    DefaultTvDbRespionse<TvDbSerie>
  >,
  BuildRouteEntry<
    "get",
    "/people/:id/extended",
    DefaultTvDbRespionse<TvDbPeople>
  >,
  BuildRouteEntry<
    "get",
    "/search",
    DefaultTvDbRespionse<TvDbSearchResult[]>,
    {
      query: string;
      type: "movie" | "series";
      limit: number;
    }
  >
  // Post
];
