import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

export type RequestHandler = (prisma: InstanceType<typeof PrismaClient>, req: Request, res: Response) => Promise<void>