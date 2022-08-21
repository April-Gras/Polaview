import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

/**
 * An in type engine extended definitionof the express middleware interface
 * Used to define Middleware functions in a type safe way
 */
export type ExpressMiddleware = (
  this: { prisma: PrismaClient },
  req: Request,
  res: Response,
  next: NextFunction
) => void;
