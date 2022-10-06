import { Movie } from ".prisma/client";
import { number } from "@intlify/core-base";
import { BuildRouteEntry } from "./Route";

export type DefaultTvDbResponse<T> = {
  status: string;
  data: T;
};

type TvDbSearchResult = {
  id: `movie-${string}` | `serie-${string}`;
  image_url: string;
  name: string;
  [key: string]: any;
};

export type TvDbCharacter = {
  id: number;
  image: string | null;
  name: string;
  peopleId: number;
  peopleType: "Actor" | "Writer" | "Director" | "Guest Star";
};

export type TvDbMovie = {
  id: number;
  characters: TvDbCharacter[] | null;
  image: string | null;
  name: string;
  lists: any[]; //TODO List feature
  year: string | null;
  overviewTranslations: string[] | null;
};

type TvDbBiography = {
  biography: string;
  language: string;
};

export type TvDbEpisode = {
  id: number;
  characters: TvDbCharacter[] | null;
  image: string | null;
  name: string;
  number: number;
  overview: string | null;
  overviewTranslations: string[] | null;
  seasonNumber: number;
  year: string | null;
};

export type TvDbSeasonType = {
  id: number;
  type: "official" | "dvd" | "absolute";
};

export type TvDbSeason = {
  id: number;
  image: string | null;
  number: number;
  seriesId: number;
  type: TvDbSeasonType;
};

type TvDbEpisodeBase = {
  id: number;
};

export type TvDbSerie = {
  id: number;
  name: string;
  image: string | null;
  seasons: TvDbSeason[]; //TODO
  overviewTranslations: string[] | null;
  episodes: TvDbEpisodeBase[];
  year: string | null;
  overview: string | null;
  seasonTypes: TvDbSeasonType[];
};

export type TvDbPeople = {
  biographies: TvDbBiography[] | null;
  birth?: string;
  birthPlace?: string;
  death?: string;
  id: number;
  image: string;
  name: string;
};

export type TvDbOverviewTranslation = {
  language: string;
  name: string;
  overview?: string;
};

export type AllRoutes = [
  // Get
  BuildRouteEntry<
    "get",
    "/movies/:id/translations/:language",
    DefaultTvDbResponse<{
      language: "string";
      name: "string";
      overview?: "string";
    }>
  >,
  BuildRouteEntry<
    "get",
    "/movies/:id/extended",
    DefaultTvDbResponse<TvDbMovie>
  >,
  BuildRouteEntry<
    "get",
    "/series/:id/extended?meta=episodes&short=true",
    DefaultTvDbResponse<TvDbSerie>
  >,
  BuildRouteEntry<
    "get",
    "/series/:id/translations/:language",
    DefaultTvDbResponse<TvDbOverviewTranslation>
  >,
  BuildRouteEntry<
    "get",
    "/episodes/:id/translations/:language",
    DefaultTvDbResponse<TvDbOverviewTranslation>
  >,
  BuildRouteEntry<
    "get",
    "/episodes/:id/extended",
    DefaultTvDbResponse<TvDbEpisode>
  >,
  BuildRouteEntry<
    "get",
    "/people/:id/extended",
    DefaultTvDbResponse<TvDbPeople>
  >,
  BuildRouteEntry<
    "get",
    "/search",
    DefaultTvDbResponse<TvDbSearchResult[]>,
    {
      query: string;
      type: "movie" | "series";
      limit: number;
    }
  >
  // Post
];
