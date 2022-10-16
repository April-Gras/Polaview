import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userHasValidSession } from "~/middlewares/userHasSession";
import { getSessionIdFromRequest } from "~/expressUtils";
import fs from "node:fs";
import { parse, stringify } from "subtitle";

const prisma = new PrismaClient();

export default async (req: Request, res: Response) => {
  const sessionid = getSessionIdFromRequest(req);
  if (!(await userHasValidSession(prisma, sessionid)))
    return res.status(403).json("Not allowed");
  const { id } = req.params;
  // Check if file exists

  try {
    const file = await prisma.fileV2.findUniqueOrThrow({
      where: {
        id: Number(id),
      },
    });

    const { path } = file;
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(path, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(path).pipe(res);
    }
  } catch (_) {
    res.statusCode = 404;
    res.statusMessage = "Not found";
    res.end("Not found");
  }
};

export const getVideoSubtitle = async (req: Request, res: Response) => {
  const sessionid = getSessionIdFromRequest(req);
  if (!(await userHasValidSession(prisma, sessionid)))
    return res.status(403).json("Not allowed");
  const { fileId, subtitleId } = req.params;

  try {
    const { subtitleTracks } = await prisma.fileV2.findUniqueOrThrow({
      where: {
        id: Number(fileId),
      },
      select: {
        subtitleTracks: {
          where: {
            id: Number(subtitleId),
          },
        },
      },
    });

    if (!subtitleTracks[0]) {
      res.statusCode = 404;
      res.statusMessage = "Not found";
      return res.end("Not found");
    }
    res.writeHead(200, {
      "Content-Type": "application/x-subrip",
    });
    fs.createReadStream(subtitleTracks[0].path)
      .pipe(parse())
      .pipe(stringify({ format: "WebVTT" }))
      .pipe(res);
  } catch (_) {
    res.statusCode = 404;
    res.statusMessage = "Not found";
    res.end("Not found");
  }
};
