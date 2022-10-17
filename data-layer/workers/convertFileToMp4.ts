import path from "node:path";
import { expose } from "threads";
import { spawn, execSync } from "node:child_process";

export type ConvertFileToMp4ThreadWorkerReturn = void;
export type ConvertFileToMp4ThreadWorker = (
  filePath: string
) => Promise<ConvertFileToMp4ThreadWorkerReturn>;

enum MachineHardwareType {
  Nvidea,
  Amd,
  Cpu,
}

const convertFileToMp4ThreadWorker: ConvertFileToMp4ThreadWorker = async (
  filePath
) => {
  const parsedPath = path.parse(filePath);
  const newFileName = `${parsedPath.dir}/${parsedPath.name}.mp4`;
  const removeCommand = `rm "${filePath}"`;
  const command = await getFfmpegCommand(filePath, newFileName);
  let fileIsMostProbablyGoodToGo = false;

  return new Promise((resolve, reject) => {
    if (filePath.endsWith(".mp4")) return;
    let NUMBER_OF_FRAMES: number | undefined;

    console.log(`Started conversion for ${path.basename(filePath)}`);
    const child = spawn(command, {
      shell: true,
    });

    child.stderr.on("data", (err: Buffer) => {
      const message = err.toString("utf-8");

      if (NUMBER_OF_FRAMES === undefined) {
        if (!message.includes("NUMBER_OF_FRAMES")) return;
        const regex = /NUMBER_OF_FRAMES(-\D*)?:(\s*)?(?<frame>\d*)/gi;
        const matches = regex.exec(message);

        if (!matches || !matches.groups || !matches.groups.frame) return;
        NUMBER_OF_FRAMES = Number(matches.groups.frame);
      } else {
        if (!message.includes("frame=")) return;
        // At this point it's pretty sure that the conversion is going well, so we can flag the source file as good to be deleted
        fileIsMostProbablyGoodToGo = true;
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
      resolve();
    });

    child.on("exit", () => {
      if (fileIsMostProbablyGoodToGo) execSync(removeCommand);
      resolve();
    });

    child.on("error", (err) => {
      console.log("error called");
      reject(err);
    });
  });
};

async function getFfmpegCommand(
  filePath: string,
  newFileName: string
): Promise<string> {
  return `ffmpeg -i "${filePath}" -c:v copy -c:a aac -y "${newFileName}"`;
}

expose(convertFileToMp4ThreadWorker);
