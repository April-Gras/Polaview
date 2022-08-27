import { PrismaClient } from "@prisma/client";
import { getSessionIdFromRequest } from "~/expressUtils";
import { userIsServer } from "~/middlewares/userIsServer";
import { ExpressMiddleware } from "~/types/ExpressMiddleware";

export const userHasSessionMiddleware: ExpressMiddleware = async function (
  req,
  res,
  next
) {
  const sessionid = getSessionIdFromRequest(req);

  if (!(await userHasValidSession(this.prisma, sessionid)))
    return res.status(403).json("Not allowed");
  next();
};

export async function userHasValidSession(
  prisma: PrismaClient,
  sessionid: string | null
): Promise<boolean> {
  if (!sessionid) return false;
  if (userIsServer(sessionid)) return true;
  const session = await prisma.session.findFirst({
    where: {
      id: sessionid,
    },
    select: {
      user: true,
    },
  });

  return !!session;
}
