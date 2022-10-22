import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryDataLayer";

import { processIdAsMovie } from "./movie";
import { processIdAsEpisode } from "./episode";

import { userIsAdmin } from "~/middlewares/userIsAdmin";

export const processEntityIdPost: GetRouteDataHandlerFromUrlAndVerb<
  "post",
  AllRoutes,
  "/processEntity"
> = async (prisma, req, res, payload) => {
  if (!(await userIsAdmin(prisma, req)))
    return res.status(403).json("Not allowed") as any;
  const { entityId, episodeInfo } = payload;
  const { type, id } = getTypeAndIdFromEntityId(entityId);

  if (type === "movie") return await processIdAsMovie(prisma, id);
  if (!episodeInfo) throw new Error("Missing episode infos");
  return await processIdAsEpisode(prisma, id, episodeInfo);
};

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
