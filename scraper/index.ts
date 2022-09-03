import { PrismaClient, Prisma } from "@prisma/client";
import express, { Express } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import { buildSingleRuntimeConfigEntry } from "~/expressUtils";
import { ScraperRuntimeConfig } from "~/types/RouteLibraryScraper";
import { userHasSessionMiddleware } from "~/middlewares/userHasSession";

import { searchPost } from "scraper/search/index";
import { latestSerieGet, latestTitleGet } from "./latest";
import {
  titleGetByImdbId,
  getTitleCastsFromMovieImdbId,
  getTitleDirectorFromMovieImdbId,
  getTitleWritersFromMovieImdbId,
  getTitleRolesFromMovieImdbId,
} from "scraper/title/index";
import { serieGet, serieGetSeaons } from "./serie";
import { titleGetSearch } from "scraper/title/search";

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT ?? "8081";

const ROUTES: ScraperRuntimeConfig = [
  buildSingleRuntimeConfigEntry("get", "/latest-movie/", latestTitleGet),
  buildSingleRuntimeConfigEntry("get", "/latest-serie/", latestSerieGet),
  buildSingleRuntimeConfigEntry(
    "get",
    "/file/titleImdbId/:imdbId",
    async (prisma, req) => {
      return await prisma.file.findFirstOrThrow({
        where: {
          titleImdbId: req.params.imdbId,
        },
      });
    }
  ),
  buildSingleRuntimeConfigEntry("get", "/serie/:imdbId", serieGet),
  buildSingleRuntimeConfigEntry(
    "get",
    "/serie/:imdbId/seasons",
    serieGetSeaons
  ),
  buildSingleRuntimeConfigEntry("get", "/title/:imdbId", titleGetByImdbId),
  buildSingleRuntimeConfigEntry(
    "get",
    "/title/:imdbId/cast",
    getTitleCastsFromMovieImdbId
  ),
  buildSingleRuntimeConfigEntry(
    "get",
    "/title/:imdbId/writers",
    getTitleWritersFromMovieImdbId
  ),
  buildSingleRuntimeConfigEntry(
    "get",
    "/title/:imdbId/directors",
    getTitleDirectorFromMovieImdbId
  ),
  buildSingleRuntimeConfigEntry(
    "get",
    "/title/:imdbId/roles",
    getTitleRolesFromMovieImdbId
  ),
  buildSingleRuntimeConfigEntry("get", "/person/:imdbId", async () => {
    return {
      imdbId: "",
      name: "",
      pictureUrl: "",
    };
  }),
  buildSingleRuntimeConfigEntry(
    "get",
    "/title/search/:searchTerm",
    titleGetSearch
  ),
  buildSingleRuntimeConfigEntry("post", "/search", searchPost),
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
        console.log(err);
        if (err instanceof Prisma.PrismaClientKnownRequestError)
          res.status(400).json(err.message);
        else res.status(400).json(err);
      });
  });
}

app.listen(port, () => {
  console.log(`ܡ scraper is running at http://localhost:${port}`);
});
