import { tvDbGetRequest } from "~/tvDbApi";

export async function getTvDbSerieFromId(id: number) {
  const {
    data: { data },
  } = await tvDbGetRequest(
    `/series/${id.toString()}/extended?meta=episodes&short=true`
  );

  return data;
}
