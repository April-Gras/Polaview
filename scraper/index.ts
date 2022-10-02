import { PrismaClient, Prisma } from "@prisma/client";
import express, { Express } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import { buildSingleRuntimeConfigEntry } from "~/expressUtils";
import { ScraperRuntimeConfig } from "~/types/RouteLibraryScraper";
import { userHasSessionMiddleware } from "~/middlewares/userHasSession";
import { addTvDbTokenToProcessEnv } from "~/addTvDbTokenToProcessEnv";

import { searchV2Post } from "./searchV2/index";
import { latestSerieGet, latestTitleGet } from "./latest";
import { fileGetByMovieId, fileGetByEpisodeId } from "./file";
import { serieGetSeaons } from "./serie";
import { cacheGetSearch } from "./cacheSearch";
import getVideoRoute, { getVideoSubtitle } from "./video";

import { processEntityIdPost } from "./process";
import { startupProcessSources } from "./utils/processSources";

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT ?? "8081";

const ROUTES: ScraperRuntimeConfig = [
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
  buildSingleRuntimeConfigEntry("post", "/searchV2", searchV2Post),
  buildSingleRuntimeConfigEntry("post", "/processEntity", processEntityIdPost),
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

async function startup() {
  await addTvDbTokenToProcessEnv();
  startupProcessSources();
  if (!process.env.TVDB_API_KEY)
    throw new Error(
      "Couldn't retrieve TVDB API KEY, are you sure your token / PIN are valid ?"
    );
  app.listen(port, async () => {
    console.log(`ܡ scraper is running at http://localhost:${port}`);
  });
}

startup();
