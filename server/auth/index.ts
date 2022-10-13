import { verify as verifyHash } from "argon2";
import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryServer";
import { getSessionIdFromRequest } from "~/expressUtils";

export const authUserGet: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/auth/user"
> = async (prisma, req) => {
  const sessionid = getSessionIdFromRequest(req);

  if (!sessionid) throw "Not logged in";
  const session = await prisma.session.findFirst({
    where: {
      id: sessionid,
    },
    select: {
      user: {
        select: {
          email: true,
          id: true,
          isActive: true,
          isAdmin: true,
          name: true,
        },
      },
    },
  });

  if (!session) throw "No session";
  return session.user;
};

export const authLoginPost: GetRouteDataHandlerFromUrlAndVerb<
  "post",
  AllRoutes,
  "/auth/login"
> = async (prisma, _, res, payload) => {
  const { email, clearPassword } = payload;
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user === null) throw "No user";
  if (!user.isAdmin && !user.isActive) throw "User not active";
  if (!(await verifyHash(user.passwordHash, clearPassword))) throw "No match";
  const session = await prisma.session.create({
    data: {
      userId: user.id,
    },
  });

  res.cookie("sessionid", session.id, {
    httpOnly: true,
    path: "/",
  });
  return {
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
    isActive: user.isActive,
  };
};

export const authLogoutPost: GetRouteDataHandlerFromUrlAndVerb<
  "post",
  AllRoutes,
  "/auth/logout"
> = async (prisma, req, res) => {
  const sessionid = getSessionIdFromRequest(req);

  if (sessionid)
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
};
