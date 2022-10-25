import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryDataLayer";

import { processIdAsMovie } from "#/processEntityHelper/processIdAsMovie";
import { processIdAsEpisode } from "#/processEntityHelper/processIdAsEpisode";
import { PrismaClient, Episode, Movie, SerieV2 } from "@prisma/client";

type ProcessEntityPayload<T extends "movie" | "serie" = "movie" | "serie"> = {
  entityId: `${T}-${number}`;
  episodeInfo: T extends "movie" ? undefined : EpisodeIndexInfo;
};

export type EpisodeIndexInfo = {
  episodeNumber: number;
  seasonNumber: number;
};

const prisma = new PrismaClient();

export async function fromBestMatchFillDb<T extends "movie" | "serie">({
  entityId,
  episodeInfo,
}: ProcessEntityPayload<T>): Promise<T extends "serie" ? Episode : Movie> {
  const { type, id } = getTypeAndIdFromEntityId(entityId);

  // @ts-expect-error
  if (type === "movie") return await processIdAsMovie(prisma, id);
  if (!episodeInfo) throw new Error("Missing episode infos");
  // @ts-expect-error
  return await processIdAsEpisode(prisma, id, episodeInfo);
}

function getTypeAndIdFromEntityId(entityId: string | undefined): {
  type: "movie" | "serie";
  id: number;
} {
  const reg = /(?<type>movie|series)-(?<id>[0-9]*)/gim;
  if (!entityId || !entityId.length) throw new Error("No entityId");

  const matches = reg.exec(entityId);
  if (!matches || !matches.groups || !matches.groups.type || !matches.groups.id)
    throw new Error("could not find entity type or id");
  const id = Number(matches.groups.id);

  if (isNaN(id)) throw new Error("id is NaN");
  return {
    // @ts-expect-error
    type: matches.groups.type,
    id,
  };
}
