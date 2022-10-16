import { tvDbGetRequest } from "#/tvDbApi";

export async function getTvDbEpisodeFromId(id: number) {
  const {
    data: { data },
  } = await tvDbGetRequest(`/episodes/${id.toString()}/extended`);

  return data;
}
