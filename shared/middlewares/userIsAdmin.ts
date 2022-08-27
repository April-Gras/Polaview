import { getSessionIdFromRequest } from "~/expressUtils";
import { userIsServer } from "~/middlewares/userIsServer";
import { ExpressMiddleware } from "~/types/ExpressMiddleware";

export const userIsAdminMiddleware: ExpressMiddleware = async function (
  req,
  res,
  next
) {
  const sessionid = getSessionIdFromRequest(req);

  if (!sessionid) return res.status(403).json("Not allowed");
  if (userIsServer(sessionid)) return next();
  const session = await this.prisma.session.findFirst({
    where: {
      id: sessionid,
    },
    select: {
      user: true,
    },
  });

  if (!session || !session.user.isAdmin)
    return res.status(403).json("Not allowed");
  next();
};
