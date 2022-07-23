import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { hash } from "argon2";
import { AllRoutes } from "~/types/RouteLibraryServer";

import { userValidator } from "~/validators/User";

export const userPost: GetRouteDataHandlerFromUrlAndVerb<
  "post",
  AllRoutes,
  "/user"
> = async (prisma, _, __, payload) => {
  if (userValidator(payload).length) throw "Malformed payload";
  const user = await prisma.user.create({
    data: {
      email: payload.email,
      name: payload.name,
      passwordHash: await hash(payload.clearPassword),
    },
    select: {
      email: true,
      name: true,
      isAdmin: true,
      isActive: true,
    },
  });

  return user;
};

export const userGetById: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/user/:id"
> = async (prisma, req) => {
  const user = await prisma.user.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });

  if (user) return user;
  throw "Missing user on create";
};

export const userPatchById: GetRouteDataHandlerFromUrlAndVerb<
  "patch",
  AllRoutes,
  "/user/:id"
> = async (prisma, req, _, payload) => {
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: payload,
  });

  return user;
};

export const getUser: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/user"
> = async (prisma) => {
  return await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      isActive: true,
      isAdmin: true,
      id: true,
    },
  });
};
