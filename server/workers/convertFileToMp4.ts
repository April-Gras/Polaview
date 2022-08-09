import path from "node:path";
import { expose } from "threads";
import { spawn, execSync } from "node:child_process";

export type ConvertFileToMp4ThreadWorkerReturn = void;
export type ConvertFileToMp4ThreadWorker = (
  filePath: string
) => Promise<ConvertFileToMp4ThreadWorkerReturn>;

const convertFileToMp4ThreadWorker: ConvertFileToMp4ThreadWorker = (
  filePath
) => {
  return new Promise((resolve, reject) => {
    if (filePath.endsWith(".mp4")) return;
    const parsedPath = path.parse(filePath);
    const newFileName = `${parsedPath.dir}/${parsedPath.name}.mp4`;
    const ffmpegCmdPath = "/root/nvidia/ffmpeg/ffmpeg";
    const command = `${ffmpegCmdPath} -hwaccel cuda -i "${filePath}" -c:v h264_nvenc -pix_fmt yuv420p -y "${newFileName}"`;
    const removeCommand = `rm "${filePath}"`;
    let NUMBER_OF_FRAMES: number | undefined;

    console.log(`Started conversion for ${path.basename(filePath)}`);
    const child = spawn(command, {
      shell: true,
    });

    child.stdout.on("data", (message) => {
      console.log({ message });
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
      console.log("exit called");
      execSync(removeCommand);
      resolve();
    });

    child.on("error", (err) => {
      console.log("error called");
      reject(err);
    });
  });
};

expose(convertFileToMp4ThreadWorker);
