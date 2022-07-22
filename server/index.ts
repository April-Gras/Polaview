import { PrismaClient, Prisma } from "@prisma/client";
import express, { Express } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import { ServerRuntimeConfig } from "~/types/RouteLibraryServer";
import { buildSingleRuntimeConfigEntry } from "~/express-utils";

import { userGetById, userPost, userPatchById } from "#/user";
import { authLoginPost, authUserGet } from "#/auth";
import { JsonCompliantData } from "~/types/Route";

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT ?? "8080";

const ROUTES: ServerRuntimeConfig = [
  buildSingleRuntimeConfigEntry("get", "/", async () => {
    return "health" as const;
  }),
  buildSingleRuntimeConfigEntry("get", "/auth/user", authUserGet),
  buildSingleRuntimeConfigEntry("get", "/user/:id", userGetById),
  buildSingleRuntimeConfigEntry("post", "/auth/login", authLoginPost),
  buildSingleRuntimeConfigEntry(
    "post",
    "/auth/logout",
    async (prisma, req, res) => {
      const { sessionid } = req.cookies;

      await prisma.session.delete({
        where: {
          id: sessionid,
        },
      });
      res.cookie("sessionid", "", {
        httpOnly: true,
        path: "/",
      });
      return true;
    }
  ),
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
    // @ts-ignore
    handler(prisma, req, res, req.body)
      .then((data: JsonCompliantData) => {
        res.status(200).json(data);
      })
      .catch((err: Error) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError)
          res.status(400).json(err.message);
        else res.status(400).json(err);
      });
  });
}

app.listen(port, () => {
  console.log(`ܡ main server is running at http://localhost:${port}`);
});
