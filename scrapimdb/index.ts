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
  buildSingleRuntimeConfigEntry("get", "/latest-movie/", async () => {
    const response = await prisma.file.findMany({
      take: 10,
      orderBy: {
        title: {
          createdOn: "asc",
        },
      },
      where: {
        title: {
          seasonId: null,
        },
      },
      select: {
        title: true,
      },
    });

    return response.map((e) => e.title);
  }),
  buildSingleRuntimeConfigEntry(
    "get",
    "/serie/:imdbId",
    async (prisma, req) => {
      const { imdbId } = req.params;

      return await prisma.serie.findFirstOrThrow({
        where: {
          imdbId: imdbId,
        },
        select: {
          imdbId: true,
          name: true,
          pictureUrl: true,
          seasons: {
            select: {
              id: true,
              serieImdbId: true,
              episodes: true,
            },
          },
        },
      });
    }
  ),
  buildSingleRuntimeConfigEntry(
    "get",
    "/serie/:imdbId/seasons",
    async (prisma, req) => {
      return await prisma.season.findMany({
        where: {
          serieImdbId: {
            equals: req.params.imdbId,
          },
        },
        select: {
          episodes: true,
          serie: true,
          id: true,
          serieImdbId: true,
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
  console.log(`ܡ scrapper is running at http://localhost:${port}`);
});
