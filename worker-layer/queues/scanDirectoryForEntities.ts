import { Queue, QueueOptions } from "bullmq";
import { redisConfig } from "#/redisConfig";
import {
  ScanDirectoryForEntitiesData,
  ScanDirectoryForEntitiesReturn,
} from "#/workers/scanDirectoryForEntities";

export function QueueScanDirectoryForEntities() {
  return new Queue<
    ScanDirectoryForEntitiesData,
    ScanDirectoryForEntitiesReturn,
    "scanDirectoryForEntities"
  >("scanDirectoryForEntities", redisConfig);
}
