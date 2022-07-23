import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

export type ExpressMiddleware = (
  this: { prisma: PrismaClient },
  req: Request,
  res: Response,
  next: NextFunction
) => void;
