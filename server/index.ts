import { buildSingleMiddleware } from "~/expressUtils";
import { userIsAdminMiddleware } from "#/middlewares/userIsAdmin";
import { AllRoutes } from "~/types/RouteLibraryServer";
import { PrismaClient, Prisma } from "@prisma/client";
import express, { Express, NextFunction, Router } from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { hash } from "argon2";

import { ServerRuntimeConfig } from "~/types/RouteLibraryServer";
import { buildSingleRuntimeConfigEntry } from "~/expressUtils";

import { getUser, userGetById, userPost, userPatchById } from "#/user";
import { authLoginPost, authUserGet, authLogoutPost } from "#/auth";
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

// CREATE Base admin user
const { BASE_ADMIN_EMAIL, BASE_ADMIN_PASSWORD, BASE_ADMIN_NAME } = process.env;

if (!BASE_ADMIN_EMAIL || !BASE_ADMIN_NAME || !BASE_ADMIN_PASSWORD)
  throw "Please set BASE_ADMIN_EMAIL, BASE_ADMIN_PASSWORD, BASE_ADMIN_NAME .env varaibles";

async function createBaseAdmin() {
  const userData = {
    name: BASE_ADMIN_NAME as string,
    passwordHash: await hash(BASE_ADMIN_PASSWORD as string),
    email: BASE_ADMIN_EMAIL as string,
  };

  if (
    !!(await prisma.user.findFirst({
      where: {
        email: BASE_ADMIN_EMAIL,
        name: BASE_ADMIN_NAME,
      },
    }))
  )
    return;
  await prisma.user.create({
    data: { ...userData, isActive: true, isAdmin: true },
  });
}
createBaseAdmin();

app.listen(port, () => {
  console.log(`ܡ main server is running at http://localhost:${port}`);
});
