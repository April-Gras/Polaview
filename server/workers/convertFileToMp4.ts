import path from "node:path";
import { expose } from "threads";
import { spawn, execSync } from "node:child_process";
import { graphics } from "systeminformation";

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
  const ffmpegCmdPath = "/root/nvidia/ffmpeg/ffmpeg";
  const nVideaBaseArgs = "-hwaccel cuda";
  const nvideoEncodingArgs = "-c:v h264_nvenc -pix_fmt yuv420p -y";
  const cpuBaseArgs = ``;
  const cpuEncodingArgs = `-c:v libx264 -pix_fmt yuv420p -y`;
  const machineHardwareType = await getMachineHardwareType();

  const baseArguments =
    machineHardwareType === MachineHardwareType.Nvidea
      ? nVideaBaseArgs
      : cpuBaseArgs;
  const encodingArgs =
    machineHardwareType === MachineHardwareType.Nvidea
      ? nvideoEncodingArgs
      : cpuEncodingArgs;
  const fullArgs = `${baseArguments} -i "${filePath}" ${encodingArgs} "${newFileName}"`;

  return `${ffmpegCmdPath} ${fullArgs}`;
}

async function getMachineHardwareType(): Promise<MachineHardwareType> {
  const gpuInfo = await graphics();
  const firstControlerInfo = gpuInfo.controllers[0];

  if (!firstControlerInfo) return MachineHardwareType.Cpu;
  if (firstControlerInfo.vendor.includes("AMD")) return MachineHardwareType.Amd;
  if (firstControlerInfo.vendor.includes("Nvidea"))
    return MachineHardwareType.Nvidea;
  return MachineHardwareType.Cpu;
}

expose(convertFileToMp4ThreadWorker);
