import {
  AxiosScrapperGetRequest,
  AxiosScrapperPostRequest,
} from "~/types/Axios";
import axios from "axios";

export const serverApiTransporter = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export const scrapIdmdbTransporter = axios.create({
  baseURL: "/scrapimdb",
  withCredentials: true,
});

export const makePostScrapImdb: AxiosScrapperPostRequest =
  scrapIdmdbTransporter.post;
// @ts-expect-error
export const makeGetScrapImdb: AxiosScrapperGetRequest =
  scrapIdmdbTransporter.get;

const scrapImdbSsTransporter = axios.create({
  baseURL: "http://scrapimdb:8081/",
});

export const makeServersidePostScrapImdb: AxiosScrapperPostRequest =
  scrapImdbSsTransporter.post;
// @ts-expect-error
export const makeServersideGetcrapImdb: AxiosScrapperGetRequest =
  scrapImdbSsTransporter.get;
