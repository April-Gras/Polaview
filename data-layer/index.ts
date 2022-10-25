import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import express, { Express } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import { buildSingleRuntimeConfigEntry } from "~/expressUtils";
import { DataLayerRuntimeConfig } from "~/types/RouteLibraryDataLayer";
import { userHasSessionMiddleware } from "~/middlewares/userHasSession";

import { searchTvDb } from "./searchTvDb";
import { searchTvDbFuzzy } from "./searchTvDbFuzzy/index";
import { latestSerieGet, latestTitleGet } from "./latest";
import { fileGetByMovieId, fileGetByEpisodeId } from "./file";
import { serieGetSeaons } from "./serie";
import { cacheGetSearch } from "./cacheSearch";
import getVideoRoute, { getVideoSubtitle } from "./video";
import { getPeopleById } from "./people";
import {
  getEntityAdditionRequests,
  postEntityAdditionRequest,
  patchEntityAdditionalRequest,
} from "./requests";

import { addTvDbTokenToProcessEnv } from "~/addTvDbTokenToProcessEnv";

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT ?? "8081";

const ROUTES: DataLayerRuntimeConfig = [
  buildSingleRuntimeConfigEntry("get", "/requests", getEntityAdditionRequests),
  buildSingleRuntimeConfigEntry("get", "/latest-movie/", latestTitleGet),
  buildSingleRuntimeConfigEntry("get", "/latest-serie/", latestSerieGet),
  buildSingleRuntimeConfigEntry("get", "/file/movie/:id/", fileGetByMovieId),
  buildSingleRuntimeConfigEntry(
    "get",
    "/file/episode/:id/",
    fileGetByEpisodeId
  ),
  buildSingleRuntimeConfigEntry("get", "/serie/:id/seasons", serieGetSeaons),
  buildSingleRuntimeConfigEntry(
    "get",
    "/cache/search/:searchTerm",
    cacheGetSearch
  ),
  buildSingleRuntimeConfigEntry("get", "/people/:id/", getPeopleById),
  // POST
  buildSingleRuntimeConfigEntry("post", "/searchTvDb", searchTvDb),
  buildSingleRuntimeConfigEntry("post", "/searchTvDbFuzzy", searchTvDbFuzzy),
  buildSingleRuntimeConfigEntry("post", "/requests", postEntityAdditionRequest),
  // PATCH
  buildSingleRuntimeConfigEntry(
    "patch",
    "/request/:id",
    patchEntityAdditionalRequest
  ),
];

app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
  userHasSessionMiddleware.bind({ prisma })(req, res, next);
});

for (const index in ROUTES) {
  const [verb, url, handler] = ROUTES[index];

  app[verb](url, (req, res) => {
    // @ts-ignore
    handler(prisma, req, res, req.body)
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        console.trace(err);
        if (err instanceof Prisma.PrismaClientKnownRequestError)
          res.status(400).json(err.message);
        else res.status(400).json(err);
      });
  });
}

app.get("/video/:id", getVideoRoute);
app.get("/video/:fileId/subtitle/:subtitleId", getVideoSubtitle);

addTvDbTokenToProcessEnv().then(() => {
  app.listen(port, async () => {
    console.log(`ܡ data-layer is running at http://localhost:${port}`);
  });
});
