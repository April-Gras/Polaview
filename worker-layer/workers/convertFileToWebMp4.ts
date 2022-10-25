import path from "node:path";
import { spawn, execSync } from "node:child_process";
import { Worker } from "bullmq";
import { redisConfig } from "#/redisConfig";

import { QueueBindFileToEntity } from "#/queues/bindFileToDbEntity";
import { findMatchingSubTracks } from "#/processEntityHelper/findMatchingSubTracksFromFullPath";

export type ConvertFileToWebMp4Return = void;
export type ConvertFileToWebMp4Data = { filePath: string; sourcePath: string };
export type ConvertFileToWebMp4QueueName = "convertFileToWebMp4";

const convertFileToWebMp4: (
  data: ConvertFileToWebMp4Data
) => Promise<ConvertFileToWebMp4Return> = async ({ filePath, sourcePath }) => {
  const parsedPath = path.parse(filePath);
  const newFileName = `${parsedPath.dir}/${parsedPath.name}.mp4`;
  const removeCommand = `rm "${filePath}"`;
  const command = getFfmpegCommand(filePath, newFileName);
  let fileIsMostProbablyGoodToGo = false;

  return new Promise((resolve, reject) => {
    if (filePath.endsWith(".mp4")) return;
    let NUMBER_OF_FRAMES: number | undefined;

    console.log(`Started conversion for ${path.basename(filePath)}`);
    const child = spawn(command, {
      shell: true,
    });

    child.stderr.on("data", (buffer: Buffer) => {
      const message = buffer.toString("utf-8");

      if (NUMBER_OF_FRAMES === undefined) {
        if (!message.includes("NUMBER_OF_FRAMES")) return;
        const regex = /NUMBER_OF_FRAMES(-\D*)?:(\s*)?(?<frame>\d*)/gi;
        const matches = regex.exec(message);

        if (!matches || !matches.groups || !matches.groups.frame) return;
        NUMBER_OF_FRAMES = Number(matches.groups.frame);
      } else {
        if (!message.includes("frame=")) return;
        const regex = /frame=(\s*)?(?<frame>\d*)/gi;
        const matches = regex.exec(message);

        if (!matches || !matches.groups || !matches.groups.frame) return;
        const { frame } = matches.groups;
        const currentFrame = Number(frame);

        console.log(
          `[${path.basename(
            newFileName
          )}] - ${currentFrame}/${NUMBER_OF_FRAMES} | ${(
            (currentFrame * 100) /
            NUMBER_OF_FRAMES
          ).toFixed(2)}%`
        );
      }
    });

    child.on("close", () => {
      console.log("close called");
      resolve();
    });

    child.on("exit", (returnCode) => {
      if (returnCode === 0) {
        // execSync(removeCommand);
        const registerEntityQueue = QueueBindFileToEntity();

        registerEntityQueue.add("bindFileToDbEntity", {
          filePath: newFileName,
          potencialSubtitleTrack: findMatchingSubTracks(newFileName),
          sourcePath,
        });
      }
      resolve();
    });

    child.on("error", (err) => {
      console.log("error called", err);
      reject(err);
    });
  });
};

function getFfmpegCommand(filePath: string, newFileName: string): string {
  return `ffmpeg -vaapi_device /dev/dri/renderD128 -i "${filePath}" -vf 'format=nv12,hwupload' -c:v h264_vaapi "${newFileName}" -y`;
}

new Worker<
  ConvertFileToWebMp4Data,
  ConvertFileToWebMp4Return,
  ConvertFileToWebMp4QueueName
>(
  "convertFileToWebMp4",
  async ({ data }) => {
    console.log(`Adding "${data.filePath}" to get converted`);
    await convertFileToWebMp4(data);
    console.log(`"${data.filePath}" conversion job finished`);
  },
  { ...redisConfig, concurrency: 4 }
);
