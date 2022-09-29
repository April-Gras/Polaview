import { Episode, PrismaClient, Prisma } from "@prisma/client";
import {
  TvDbEpisode,
  TvDbSeason,
  TvDbSerie,
} from "~/types/RouteLibraryTvDbApi";

export function upsertEpisodeCollectionAndSerieAndSeason(
  prisma: PrismaClient,
  episodes: TvDbEpisode[],
  seasons: TvDbSeason[],
  serie: TvDbSerie
) {
  return episodes.reduce((accumulator, episode) => {
    const targetSeason = seasons.find((e) => e.number === episode.seasonNumber);

    if (!targetSeason) return accumulator;
    accumulator.push(
      prisma.episode.upsert({
        where: {
          id: episode.id,
        },
        create: {
          id: episode.id,
          number: episode.number,
          overview: episode.overview || undefined,
          image: episode.image || undefined,
          name: episode.name,
          season: {
            connectOrCreate: {
              where: {
                id: targetSeason.id,
              },
              create: {
                id: targetSeason.id,
                number: targetSeason.number,
                image: targetSeason.image || undefined,
                serie: {
                  connectOrCreate: {
                    where: {
                      id: serie.id,
                    },
                    create: {
                      id: serie.id,
                      name: serie.name,
                      image: serie.image,
                      overview: serie.overview || undefined,
                    },
                  },
                },
              },
            },
          },
          serie: {
            connectOrCreate: {
              where: {
                id: serie.id,
              },
              create: {
                id: serie.id,
                name: serie.name,
                image: serie.image,
                overview: serie.overview || undefined,
              },
            },
          },
        },
        update: {
          id: episode.id,
          name: episode.name,
          image: episode.image || undefined,
          number: episode.number,
        },
      })
    );
    return accumulator;
  }, [] as Prisma.Prisma__EpisodeClient<Episode>[]);
}
