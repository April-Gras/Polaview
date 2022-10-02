import {
  Episode,
  EpisodeOverviewTranslation,
  PrismaClient,
} from "@prisma/client";

import { EpisodeIndexInfo } from "~/types/RouteLibraryScraper";
import {
  TvDbSeasonType,
  TvDbEpisode,
  TvDbSerie,
  TvDbPeople,
} from "~/types/RouteLibraryTvDbApi";

import { getTvDbSerieFromId } from "#/tvdb-api/getTvDbSerieFromId";
import { getTvDbEpisodeFromId } from "#/tvdb-api/getTvDbEpisodeFromId";
import { getTranslations } from "#/tvdb-api/getEpisodeOverviewTranslations";
import { upsertEpisodeCollectionAndSerieAndSeason } from "#/transactionsV2/upsertEpisodeCollectionAndSerieAndSeason";
import { upsertAndConnectEpisodeOverviewTranslations } from "#/transactionsV2/upsertAndConnectEpisodeOverviewTranslationCollection";

import { getCharactersFromEntity } from "./character";
import { handleHumans } from "./humans";

export async function processIdAsEpisode(
  prisma: PrismaClient,
  id: number,
  episodeInfo: EpisodeIndexInfo
): Promise<Episode> {
  const serie = await getTvDbSerieFromId(id);
  const seasons = getSeasonsFromTvDbSerie(serie);
  const episodeIds = serie.episodes.map(({ id }) => id);

  if (!serie || !seasons.length || !episodeIds.length)
    throw new Error("Missing data to build episode listing");

  const episodes = await getEpisodesFromIds(episodeIds);
  const [episodeOnPeople, episodeOnOverviewTranslations] = await Promise.all([
    getEpisodeOnPeople(episodes),
    getEpisodeOnOverviewTranslations(episodes),
  ]);

  await prisma.$transaction([
    ...upsertEpisodeCollectionAndSerieAndSeason(
      prisma,
      episodes,
      seasons,
      serie
    ),
    ...episodes.flatMap((episode) => {
      const { cast, writers, directors } = episodeOnPeople[episode.id];
      const allPeoples = [...cast, ...writers, ...directors];

      return handleHumans(
        prisma,
        episode.id,
        episode,
        allPeoples,
        cast,
        writers,
        directors,
        "episode"
      );
    }),
  ]);
  await Promise.allSettled(
    episodes.flatMap((episode) => {
      const translations = episodeOnOverviewTranslations[episode.id];

      return upsertAndConnectEpisodeOverviewTranslations(prisma, translations);
    })
  );

  return await prisma.episode.findFirstOrThrow({
    where: {
      season: {
        number: episodeInfo.seasonNumber,
      },
      number: episodeInfo.episodeNumber,
    },
  });
}

function getSeasonsFromTvDbSerie(tvDbSeries: TvDbSerie) {
  const priorityType = [
    "official",
    "absolute",
    "dvd",
  ] as TvDbSeasonType["type"][];
  const { seasons: allSeasons } = tvDbSeries;
  const selectedSeason = allSeasons.sort((e) =>
    priorityType.indexOf(e.type.type)
  )[0];

  if (!selectedSeason) throw new Error("Missing selected type");

  const selectedType = selectedSeason.type.type;
  const seasons = allSeasons.filter(
    ({ type: { type }, number }) => type === selectedType && number !== 0
  );

  return seasons;
}

async function getEpisodesFromIds(episodeIds: number[]) {
  return (
    await Promise.allSettled(
      episodeIds.map((singleEpisodeId) => getTvDbEpisodeFromId(singleEpisodeId))
    )
  ).reduce((accumulator, response) => {
    if (response.status === "fulfilled") accumulator.push(response.value);
    return accumulator;
  }, [] as TvDbEpisode[]);
}

async function getEpisodeOnPeople(episodes: TvDbEpisode[]) {
  const episodeOnPeoples: Record<
    number,
    { cast: TvDbPeople[]; writers: TvDbPeople[]; directors: TvDbPeople[] }
  > = {};

  for (const episode of episodes) {
    const [cast, writers, directors] = await getCharactersFromEntity(episode);

    episodeOnPeoples[episode.id] = { cast, writers, directors };
  }
  return episodeOnPeoples;
}

async function getEpisodeOnOverviewTranslations(
  episodes: TvDbEpisode[]
): Promise<Record<number, EpisodeOverviewTranslation[]>> {
  const episodeOnOverviewTranslations: Record<
    number,
    EpisodeOverviewTranslation[]
  > = {};

  for (const episode of episodes)
    episodeOnOverviewTranslations[episode.id] = await getTranslations(episode);
  return episodeOnOverviewTranslations;
}
