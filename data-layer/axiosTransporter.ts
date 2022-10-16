import axios from "axios";
import {
  AxiosDataLayerGetRequest,
  AxiosDataLayerPostRequest,
} from "~/types/Axios";

const authLayerSideDataLayerTransporter = axios.create({
  baseURL: "http://data-layer:8081/",
  headers: {
    sessionid: process.env.INTERSERVER_TOKEN || "",
  },
});

/**
 * Axios Post Request builder used to comunicate to the DataLayer
 *
 * This should only be used auth-layer side !
 */
export const makeServersidePostDataLayer: AxiosDataLayerPostRequest =
  authLayerSideDataLayerTransporter.post;

/**
 * Axios Get Request builder used to comunicate to the DataLayer
 *
 * This should only be used auth-layer side !
 */
// @ts-expect-error
export const makeServersideGetDataLayer: AxiosDataLayerGetRequest =
  authLayerSideDataLayerTransporter.get;
