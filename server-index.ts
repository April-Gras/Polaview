import { PrismaClient } from "@prisma/client";
import express, { Express } from "express";
import { RequestHandler } from "./types/RequestHandler";

import { userPost, userGetById } from "./server/user/index";

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT ?? "8080";

type Verb = "get" | "post" | "delete" | "patch";

function buildRoute<
  V extends Verb,
  U extends string,
  H extends RequestHandler,
  EXTPECTED_RETURN = undefined,
  EXPECTED_PAYLOAD = undefined
>(
  verb: V,
  url: U,
  handler: H
): {
  url: U;
  verb: V;
  expectedReturn: EXTPECTED_RETURN;
  expectedPayload: EXPECTED_PAYLOAD;
} {
  app[verb](url, (req, res) => {
    handler(prisma, req, res);
  });
  // @ts-ignore
  return;
}

type RoutingType = ReturnType<typeof buildRoute>;

const TGetRoot = buildRoute("get", "/", async (_, __, res) => {
  res.status(200).send("health");
});
const TUserPost = buildRoute("post", "/user", userPost);
const TUserGetById = buildRoute("get", "/user/:id", userGetById);

export type Routing = [typeof TGetRoot, typeof TUserPost, typeof TUserGetById];

export type ExtractRoutesFromVerb<
  V extends Verb,
  R = Routing,
  PREVIOUS extends RoutingType[] = []
> = R extends [infer ROUTE, ...infer REST]
  ? ROUTE extends RoutingType
    ? ROUTE["verb"] extends V
      ? ExtractRoutesFromVerb<V, REST, [ROUTE, ...PREVIOUS]>
      : ExtractRoutesFromVerb<V, REST, [...PREVIOUS]>
    : PREVIOUS
  : PREVIOUS;

export type GetRoutes = ExtractRoutesFromVerb<"get", Routing>;
export type PostRoutes = ExtractRoutesFromVerb<"post", Routing>;
export type DeleteRoutes = ExtractRoutesFromVerb<"delete", Routing>;
export type PatchRoutes = ExtractRoutesFromVerb<"patch", Routing>;

app.listen(port, () => {
  console.log(`⚡️ Polaview-server is running at http://localhost:${port}`);
});
