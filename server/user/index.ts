import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { hash } from "argon2";

import { userValidator } from "~/validators/User";

export const userPost: GetRouteDataHandlerFromUrlAndVerb<
  "post",
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
    },
  });

  return user;
};

export const userGetById: GetRouteDataHandlerFromUrlAndVerb<
  "get",
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
  "/user/:id"
> = async (prisma, req, res, payload) => {
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: payload,
  });

  return user;
};
