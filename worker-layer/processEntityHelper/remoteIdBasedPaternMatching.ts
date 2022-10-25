import { makeServersidePostDataLayer } from "#/axiosTransporter";

import { applyInfoColor } from "#/utils/workerLayerLogs";

export async function remoteIdBasedPaternMatching(remoteId: string) {
  console.log(applyInfoColor(`Looking for remoteId ${remoteId}`));
  const { data: entity } = await makeServersidePostDataLayer("/searchTvDb", {
    remoteId,
  });

  if (!entity)
    throw new Error(`No entity was returned from the remote id ${remoteId}`);
  return entity;
}
