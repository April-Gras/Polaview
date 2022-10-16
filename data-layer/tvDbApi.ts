import axios from "axios";
import { setupCache, buildStorage } from "axios-cache-interceptor";
import { createClient } from "redis";
import { AxiosTvDbApiPostRequest, AxiosTvDbApiGetRequest } from "~/types/Axios";

const client = createClient({
  url: "redis://cache:6379",
});
client.on("error", function (err) {
  console.error(err);
});
client.connect();

const tvDbTransporter = setupCache(
  axios.create({
    baseURL: "https://api4.thetvdb.com/v4/",
    transformRequest(data, headers) {
      if (headers)
        headers["authorization"] = `Bearer ${process.env.TVDB_API_KEY}`;
      return JSON.stringify(data);
    },
  }),
  {
    storage: buildStorage({
      async find(key) {
        const result = await client.get(`axios-cache:${key}`);
        return result ? JSON.parse(result) : null;
      },

      async set(key, value) {
        await client.set(`axios-cache:${key}`, JSON.stringify(value));
      },

      async remove(key) {
        await client.del(`axios-cache:${key}`);
      },
    }),
    ttl: 1000 * 60 * 60,
  }
);

export const tvDbPostRequest: AxiosTvDbApiPostRequest = tvDbTransporter.post;
// @ts-expect-error
export const tvDbGetRequest: AxiosTvDbApiGetRequest = (
  url,
  payload,
  config
) => {
  return tvDbTransporter.get(url, {
    ...(config || {}),
    params: payload,
  });
};
