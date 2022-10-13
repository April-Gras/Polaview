import { getSessionIdFromRequest } from "~/expressUtils";
import { userIsServer } from "~/middlewares/userIsServer";
import type { ExpressMiddleware } from "~/types/ExpressMiddleware";
import type { Request } from "express";
import { PrismaClient } from "@prisma/client";

export const userIsAdminMiddleware: ExpressMiddleware = async function (
  req,
  res,
  next
) {
  if (!(await userIsAdmin(this.prisma, req)))
    return res.status(403).json("Not allowed");
  next();
};

export const userIsAdmin = async (prisma: PrismaClient, req: Request) => {
  const sessionid = getSessionIdFromRequest(req);

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

  if (!session || !session.user.isAdmin) return false;
  return true;
};
