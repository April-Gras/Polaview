import { Queue } from "bullmq";
import { redisConfig } from "#/redisConfig";

import type {
  BindFileToDbEntityData,
  BindFileToDbEntityQueueName,
  BindFileToDbEntityReturn,
} from "#/workers/bindFileToDbEntity";

export function QueueBindFileToEntity() {
  return new Queue<
    BindFileToDbEntityData,
    BindFileToDbEntityReturn,
    BindFileToDbEntityQueueName
  >("bindFileToDbEntity", redisConfig);
}
