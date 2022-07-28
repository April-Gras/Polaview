import { PrismaClient, Prisma } from "@prisma/client";
import express, { Express } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import { buildSingleRuntimeConfigEntry } from "~/expressUtils";
import { ScrapImdbRuntimeConfig } from "~/types/RouteLibraryScrapImdb";

import { searchPost } from "#/search/index";
import { titleGetByImdbId, getTitleCastsFromMovieImdbId } from "#/title/index";

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT ?? "8081";

const ROUTES: ScrapImdbRuntimeConfig = [
  buildSingleRuntimeConfigEntry(
    "get",
    "/serie/:imdbId",
    async (prisma, req) => {
      const { imdbId } = req.params;

      return await prisma.serie.findFirstOrThrow({
        where: {
          imdbId,
        },
      });
    }
  ),
  buildSingleRuntimeConfigEntry("get", "/title/:imdbId", titleGetByImdbId),
  buildSingleRuntimeConfigEntry(
    "get",
    "/title/:imdbId/cast",
    getTitleCastsFromMovieImdbId
  ),
  buildSingleRuntimeConfigEntry("get", "/person/:imdbId", async () => {
    return {
      imdbId: "",
      name: "",
      pictureUrl: "",
    };
  }),
  buildSingleRuntimeConfigEntry("post", "/search", searchPost),
];

app.use(bodyParser.json());
app.use(cookieParser());

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
  console.log(`ܡ main server is running at http://localhost:${port}`);
});
