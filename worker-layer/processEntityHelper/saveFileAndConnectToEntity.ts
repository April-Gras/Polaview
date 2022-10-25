import crypto from "node:crypto";

import { PrismaClient, Movie, Episode } from "@prisma/client";
import { applySuccessColor } from "#/utils/workerLayerLogs";

const prisma = new PrismaClient();

export async function saveFileAndConnectToEntity<T extends "movie" | "episode">(
  sourcePath: string,
  filePath: string,
  type: T,
  targetEntity: T extends "movie" ? Movie : Episode,
  potencialSubtitleTrack: string[]
) {
  const hashFunction = crypto.createHash("sha256");
  const source = await prisma.fileSourceV2.upsert({
    where: {
      path: sourcePath,
    },
    create: {
      path: sourcePath,
    },
    update: {
      updatedOn: new Date(),
    },
  });
  // Hashing the filename to an id so we guaranty the id to be unique when threaded because prisma concurrency is a lie
  const fileId = Math.abs(
    hashFunction
      .update(filePath + type)
      .digest()
      .readInt32LE()
  );
  const file = await prisma.fileV2.upsert({
    where: {
      id: fileId,
    },
    create: {
      id: fileId,
      path: filePath,
      fileSource: {
        connect: {
          path: source.path,
        },
      },
      [type]: {
        connect: {
          id: targetEntity.id,
        },
      },
    },
    update: {
      path: filePath,
      fileSource: {
        connect: {
          path: source.path,
        },
      },
      [type]: {
        connect: {
          id: targetEntity.id,
        },
      },
    },
    include: {
      [type]: true,
      fileSource: true,
    },
  });
  const subtitle = await prisma.$transaction(
    potencialSubtitleTrack.map((subtitlePath) => {
      return prisma.subtitleTrack.upsert({
        where: {
          path_fileV2Id: {
            fileV2Id: file.id,
            path: subtitlePath,
          },
        },
        create: {
          fileV2: {
            connect: {
              id: file.id,
            },
          },
          path: subtitlePath,
        },
        update: {
          fileV2: {
            connect: {
              id: file.id,
            },
          },
          path: subtitlePath,
        },
      });
    })
  );
  console.log(
    applySuccessColor(
      `Saved file in id ${file.id} with ${subtitle.length} subtitle tracks`
    )
  );
  return file;
}
