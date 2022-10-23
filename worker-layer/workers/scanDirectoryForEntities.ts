import path from "node:path";
import fs, { readdirSync, lstatSync } from "node:fs";
import { Worker } from "bullmq";
import { redisConfig } from "#/redisConfig";

import { QueueScanDirectoryForEntities } from "#/queues/scanDirectoryForEntities";

export type ScanDirectoryForEntitiesReturn = void;
export type ScanDirectoryForEntitiesData = {
  source: string;
  directory: string;
};
type ScanDirectoryForEntities = (
  data: ScanDirectoryForEntitiesData
) => Promise<ScanDirectoryForEntitiesReturn>;

const SUPPORTED_MEDIA_EXTENTIONS = [".mkv", ".mp4", ".avi"];

const scanDirectoryForMovies: ScanDirectoryForEntities = async ({
  source,
  directory,
}) => {
  if (!directory) directory = source;
  const filePaths = readdirSync(directory, {
    encoding: "utf-8",
  });

  const { toProcessDirectories, toProcessFiles } = filePaths.reduce(
    (accumulator, filePath) => {
      if (filePath.startsWith(".") || filePath.includes("sample"))
        return accumulator;
      const targetPath = path.resolve(directory, filePath);

      const lstat = lstatSync(targetPath);

      if (
        lstat.isFile() &&
        SUPPORTED_MEDIA_EXTENTIONS.includes(path.extname(targetPath))
      )
        accumulator.toProcessFiles.push(targetPath);
      if (lstat.isDirectory())
        accumulator.toProcessDirectories.push(targetPath);
      return accumulator;
    },
    { toProcessFiles: [], toProcessDirectories: [] } as {
      toProcessFiles: string[];
      toProcessDirectories: string[];
    }
  );

  handleFilesFormat(toProcessFiles);
  // Send found directories to the queue
  const directoryQueue = QueueScanDirectoryForEntities();
  toProcessDirectories.map((directory) =>
    directoryQueue.add("scanDirectoryForEntities", { directory, source })
  );
  // TODO Send already well formated files to get catalogued
};

function handleFilesFormat(files: string[]): void {
  const notMp4Files = files.filter(
    (pathName) => path.extname(pathName) !== ".mp4"
  );

  // Todo send to mp4 converter
  // mp4 conversion will launch catalog process itself
  return;
}

function findMatchingSubTracks(wellFormatedFilePath: string) {
  const targetExtentions = [".srt"];

  return targetExtentions.reduce((accumulator, targetExtention) => {
    const potencialSubtitleTrack = wellFormatedFilePath.replace(
      /\.mp4/,
      targetExtention
    );

    if (fs.existsSync(potencialSubtitleTrack))
      accumulator.push(potencialSubtitleTrack);
    return accumulator;
  }, [] as string[]);
}

new Worker<
  ScanDirectoryForEntitiesData,
  ScanDirectoryForEntitiesReturn,
  "scanDirectoryForEntities"
>(
  "scanDirectoryForEntities",
  async ({ data: { source, directory } }) => {
    scanDirectoryForMovies({ source, directory });
  },
  redisConfig
);
