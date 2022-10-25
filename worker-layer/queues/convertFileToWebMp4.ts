import { Queue } from "bullmq";

import type {
  ConvertFileToWebMp4Data,
  ConvertFileToWebMp4QueueName,
  ConvertFileToWebMp4Return,
} from "#/workers/convertFileToWebMp4";
import { redisConfig } from "#/redisConfig";

export function QueueConvertFileToWebMp4() {
  return new Queue<
    ConvertFileToWebMp4Data,
    ConvertFileToWebMp4Return,
    ConvertFileToWebMp4QueueName
  >("convertFileToWebMp4", redisConfig);
}
