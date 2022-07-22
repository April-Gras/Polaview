import { PrismaClient, Prisma } from "@prisma/client";
import express, { Express } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { spawn, Worker } from "threads";

import { SearchThreadWorker } from "#/workers/search";
import { SaveSearchThreadWorker } from "./workers/saveSearch";

import { buildSingleRuntimeConfigEntry } from "~/express-utils";
import { ScrapImdbRuntimeConfig } from "~/types/RouteLibraryScrapImdb";

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT ?? "8081";

const ROUTES: ScrapImdbRuntimeConfig = [
  buildSingleRuntimeConfigEntry(
    "post",
    "/search",
    async (prisma, _, __, { term }) => {
      console.log({ term });
      if (!term || !term.length) return [];
      const searchCacheEntry = await prisma.imdbSearchCache.findFirst({
        where: {
          term,
        },
      });

      console.log({ searchCacheEntry: !!searchCacheEntry });
      if (!searchCacheEntry) {
        const searchThread: SearchThreadWorker = await spawn(
          new Worker("./workers/search.ts", {})
        );
        const saveSearchThread: SaveSearchThreadWorker = await spawn(
          new Worker("./workers/saveSearch.ts")
        );
        const scrapResults = await searchThread(term);

        saveSearchThread({ results: scrapResults, term });
        return scrapResults;
      }
      const searchResults = await prisma.imdbSearch.findMany({
        where: { imdbSearchCacheTerm: searchCacheEntry.term },
      });

      return searchResults;
    }
  ),
];

app.use(bodyParser.json());
app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});
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
        if (err instanceof Prisma.PrismaClientKnownRequestError)
          res.status(400).json(err.message);
        else res.status(400).json(err);
      });
  });
}

app.listen(port, () => {
  console.log(`ܡ main server is running at http://localhost:${port}`);
});
