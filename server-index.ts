import { PrismaClient, Prisma } from "@prisma/client";
import express, { Express } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import {
  RuntimeConfig,
  Verb,
  JsonCompliantData,
  BuildHandlerFromData,
  SingleRuntimeConfig,
} from "./types/Route";
import { userGetById, userPost, userPatchById } from "./server/user";
import { authLoginPost, authUserGet } from "./server/auth";

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT ?? "8080";

function buildSingleRuntimeConfigEntry<
  V extends Verb,
  URL extends string,
  RETURN extends JsonCompliantData,
  PAYLOAD extends JsonCompliantData | undefined
>(
  verb: V,
  url: URL,
  fn: BuildHandlerFromData<RETURN, PAYLOAD>
): SingleRuntimeConfig<[V, URL, RETURN, PAYLOAD]> {
  return [verb, url, fn];
}

const ROUTES: RuntimeConfig = [
  buildSingleRuntimeConfigEntry("get", "/", async () => {
    return "health" as const;
  }),
  buildSingleRuntimeConfigEntry("get", "/auth/user", authUserGet),
  buildSingleRuntimeConfigEntry("get", "/user/:id", userGetById),
  buildSingleRuntimeConfigEntry("post", "/auth/login", authLoginPost),
  buildSingleRuntimeConfigEntry("post", "/user", userPost),
  buildSingleRuntimeConfigEntry("patch", "/user/:id", userPatchById),
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
  console.log(`ܡ is running at http://localhost:${port}`);
});
