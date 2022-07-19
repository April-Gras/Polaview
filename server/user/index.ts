import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";

export const userPost: GetRouteDataHandlerFromUrlAndVerb<
  "post",
  "/user"
> = async (prisma, req) => {
  const user = await prisma.user.create({
    data: req.body,
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
