import {
  Character,
  People,
  FileV2,
  SearchResult,
  Movie,
  Episode,
  SeasonV2,
  SerieV2,
  MovieOverviewTranslation,
  EpisodeOverviewTranslation,
  SerieOverviewTranslation,
  SubtitleTrack,
} from "@prisma/client";
import { BuildRouteEntry, RuntimeConfigBuilder } from "~/types/Route";

export type SeasonSummary = SeasonV2 & { episodes: Episode[] };

export type SerieSummary = SerieV2 & {
  _count: {
    seasons: number;
    episodes: number;
  };
};

export type SerieExtendedSummary = SerieV2 & {
  overviews: SerieOverviewTranslation[];
  seasons: (SeasonV2 & {
    episodes: (Episode & {
      _count: {
        files: number;
      };
    })[];
  })[];
};

type FileSummaryAdditions<ENTITY extends Episode | Movie> =
  ENTITY extends Episode
    ? {
        episode: Episode & {
          overviews: EpisodeOverviewTranslation[];
          episodeOnCast: {
            people: People;
          }[];
          episodeOnWriter: {
            people: People;
          }[];
          episodeOnDirector: {
            people: People;
          }[];
        } & { characters: Character[] };
      }
    : {
        movie: Movie & {
          overviews: MovieOverviewTranslation[];
          movieOnCast: {
            people: People;
          }[];
          movieOnWriter: {
            people: People;
          }[];
          movieOnDirector: {
            people: People;
          }[];
        } & { characters: Character[] };
      };
export type FileSummary<ENTITY extends Episode | Movie> = FileV2 & {
  subtitleTracks: SubtitleTrack[];
} & FileSummaryAdditions<ENTITY>;

export type EpisodeIndexInfo = {
  episodeNumber: number;
  seasonNumber: number;
};

type ProcessEntityPayload<T extends "movie" | "serie" = "movie" | "serie"> = {
  entityId: `${T}-${number}`;
  episodeInfo: T extends "movie" ? undefined : EpisodeIndexInfo;
};

export type AllRoutes = [
  // GET
  BuildRouteEntry<"get", "/latest-movie/", Movie[]>,
  BuildRouteEntry<"get", "/latest-serie/", SerieSummary[]>,
  BuildRouteEntry<"get", "/file/movie/:id/", FileSummary<Movie>>,
  BuildRouteEntry<"get", "/file/episode/:id/", FileSummary<Episode>>,
  BuildRouteEntry<"get", "/serie/:id/seasons", SerieExtendedSummary>,
  BuildRouteEntry<
    "get",
    "/cache/search/:searchTerm",
    {
      series: (SerieV2 & { overviews: SerieOverviewTranslation[] })[];
      movies: (Movie & { overviews: MovieOverviewTranslation[] })[];
    }
  >,
  // POST
  BuildRouteEntry<
    "post",
    "/searchV2",
    SearchResult[],
    { query: string; type: "movie" | "series" }
  >,
  BuildRouteEntry<
    "post",
    "/processEntity",
    Movie | Episode,
    ProcessEntityPayload
  >
  // PATCH
  // DELETE
];

export type ScraperRuntimeConfig = RuntimeConfigBuilder<AllRoutes>;
