import { ExpressMiddleware } from "~/types/ExpressMiddleware";
import { getSessionIdFromRequest } from "~/expressUtils";

export const userIsServerMiddleware: ExpressMiddleware = async (
  req,
  res,
  next
) => {
  const sessionId = getSessionIdFromRequest(req);

  if (!sessionId || !userIsServer(sessionId))
    return res.status(403).json("Not allowed");
  next();
};

export const userIsServer = (sessionId: string) => {
  const token = process.env.INTERSERVER_TOKEN;

  if (typeof token !== "string") {
    console.error("Missing INTERSERVER_TOKEN in .env, shutting down");
    process.exit(1);
  }

  if (!sessionId || sessionId !== token) return false;
  return true;
};
