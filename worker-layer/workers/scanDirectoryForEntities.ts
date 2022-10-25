import path from "node:path";
import { readdirSync, lstatSync } from "node:fs";
import { Worker } from "bullmq";
import { redisConfig } from "#/redisConfig";

import { findMatchingSubTracks } from "#/processEntityHelper/findMatchingSubTracksFromFullPath";

import { QueueScanDirectoryForEntities } from "#/queues/scanDirectoryForEntities";
import { QueueConvertFileToWebMp4 } from "#/queues/convertFileToWebMp4";
import { QueueBindFileToEntity } from "#/queues/bindFileToDbEntity";

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

  handleFilesFormat(toProcessFiles, source);

  const directoryQueue = QueueScanDirectoryForEntities();
  toProcessDirectories.map((directory) =>
    directoryQueue.add("scanDirectoryForEntities", { directory, source })
  );
  const registerEntityQueue = QueueBindFileToEntity();

  toProcessFiles
    .filter((pathName) => path.extname(pathName) === ".mp4")
    .forEach((filePath) => {
      const wholePath = path.resolve(directory, filePath);

      return registerEntityQueue.add("bindFileToDbEntity", {
        filePath: wholePath,
        potencialSubtitleTrack: findMatchingSubTracks(wholePath),
        sourcePath: source,
      });
    });
};

function handleFilesFormat(files: string[], sourcePath: string): void {
  const notMp4Files = files.filter(
    (pathName) => path.extname(pathName) !== ".mp4"
  );
  const queue = QueueConvertFileToWebMp4();

  notMp4Files.forEach((filePath) => {
    queue.add("convertFileToWebMp4", { filePath, sourcePath });
  });
}

new Worker<
  ScanDirectoryForEntitiesData,
  ScanDirectoryForEntitiesReturn,
  "scanDirectoryForEntities"
>(
  "scanDirectoryForEntities",
  async ({ data }) => {
    console.log(
      `Started scanning for content in directory "${data.directory}"`
    );
    scanDirectoryForMovies(data);
  },
  redisConfig
);
