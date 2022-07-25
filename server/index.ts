import "dotenv/config";
import express, { Express, Router } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import { PrismaClient, Prisma } from "@prisma/client";

import { buildSingleMiddleware } from "~/expressUtils";

import { ServerRuntimeConfig } from "~/types/RouteLibraryServer";
import { buildSingleRuntimeConfigEntry } from "~/expressUtils";
import { AllRoutes } from "~/types/RouteLibraryServer";

import { userIsAdminMiddleware } from "#/middlewares/userIsAdmin";

import { startupCreateBaseUsers } from "#/startupUtils/createBaseUser";
import { startupProcessSources } from "#/startupUtils/processSources";

import { getUser, userGetById, userPost, userPatchById } from "#/user";
import { authLoginPost, authUserGet, authLogoutPost } from "#/auth";
import { JsonCompliantData } from "~/types/Route";

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT ?? "8080";

startupCreateBaseUsers(prisma);
startupProcessSources(prisma);

const ROUTES: ServerRuntimeConfig = [
  buildSingleRuntimeConfigEntry("get", "/", async () => {
    return "health" as const;
  }),
  buildSingleRuntimeConfigEntry("get", "/auth/user", authUserGet),
  buildSingleRuntimeConfigEntry("get", "/user/:id", userGetById),
  buildSingleRuntimeConfigEntry("get", "/user", getUser),
  buildSingleRuntimeConfigEntry("post", "/auth/login", authLoginPost),
  buildSingleRuntimeConfigEntry("post", "/auth/logout", authLogoutPost),
  buildSingleRuntimeConfigEntry("post", "/user", userPost),
  buildSingleRuntimeConfigEntry(
    "post",
    "/user/toggleIsActivate",
    async (prisma, _, __, { id }) => {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user || user.isAdmin) throw "Illegal Operation";
      const updatedUser = await prisma.user.update({
        where: {
          id,
        },
        data: {
          isActive: !user.isActive,
        },
        select: {
          email: true,
          id: true,
          isActive: true,
          isAdmin: true,
          name: true,
        },
      });
      return updatedUser;
    }
  ),
  buildSingleRuntimeConfigEntry("patch", "/user/:id", userPatchById),
];

const router = Router();
const MIDDLEWARES = [
  buildSingleMiddleware<AllRoutes, "get">(
    "get",
    "/user",
    userIsAdminMiddleware
  ),
  buildSingleMiddleware<AllRoutes, "post">(
    "post",
    "/user/activate",
    userIsAdminMiddleware
  ),
] as const;

app.use(bodyParser.json());
app.use(cookieParser());
app.use("/", router);

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

for (const index in MIDDLEWARES) {
  const [verb, url, handler] = MIDDLEWARES[index];

  // @ts-ignore
  router[verb](url, (req, res, next) => {
    handler.bind({ prisma })(req, res, next);
  });
}

app.listen(port, () => {
  console.log(`ܡ main server is running at http://localhost:${port}`);
});
