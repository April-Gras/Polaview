import { verify as verifyHash } from "argon2";
import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";

export const authUserGet: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  "/auth/user"
> = async (prisma, req) => {
  const { sessionid } = req.cookies;

  if (!sessionid || sessionid instanceof Array) throw "Not logged in";
  const session = await prisma.session.findFirst({
    where: {
      id: sessionid,
    },
    select: {
      user: true,
    },
  });

  if (!session) throw "No session";
  return session.user;
};

export const authLoginPost: GetRouteDataHandlerFromUrlAndVerb<
  "post",
  "/auth/login"
> = async (prisma, _, res, payload) => {
  const { email, clearPassword } = payload;
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user === null) throw "No user";
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
  };
};
