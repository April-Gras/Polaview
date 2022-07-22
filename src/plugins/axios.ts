import axios from "axios";
import "pinia";
import { PiniaPluginContext } from "pinia";
import { Plugin, markRaw } from "vue";
import {
  AxiosGetRequest,
  AxiosDeleteRequest,
  AxiosPatchRequest,
  AxiosPostRequest,
  AxiosScrapperPostRequest,
} from "~/types/Axios";

const serverApiTransporter = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

const scrapIdmdbTransporter = axios.create({
  baseURL: "/scrapimdb",
  withCredentials: true,
});

// Vue3 Plugin
export const axiosPlugin: Plugin = {
  install(app) {
    app.config.globalProperties.$postRequest = serverApiTransporter.post;
    app.config.globalProperties.$getRequest = serverApiTransporter.get;
    app.config.globalProperties.$deleteRequest = serverApiTransporter.delete;
    app.config.globalProperties.$patchRequest = serverApiTransporter.patch;
    app.config.globalProperties.$postScrapImdbRequest =
      scrapIdmdbTransporter.post;
  },
};

declare module "vue" {
  interface ComponentCustomProperties {
    $postRequest: AxiosPostRequest;
    $getRequest: AxiosGetRequest;
    $patchRequest: AxiosPatchRequest;
    $deleteRequest: AxiosDeleteRequest;
    $postScrapImdbRequest: AxiosScrapperPostRequest;
  }
}

// Pinia pluin
export function axiosPiniaPlugin({ store }: PiniaPluginContext) {
  // @ts-ignore
  store.$postRequest = markRaw(serverApiTransporter.post);
  // @ts-ignore
  store.$patchRequest = markRaw(serverApiTransporter.patch);
  // @ts-ignore
  store.$getRequest = markRaw(serverApiTransporter.get);
  // @ts-ignore
  store.$deleteRequest = markRaw(serverApiTransporter.delete);
  // @ts-ignore
  store.$postScrapImdbRequest = markRaw(scrapIdmdbTransporter.post);
}

declare module "pinia" {
  export interface PiniaCustomProperties {
    $postRequest: AxiosPostRequest;
    $getRequest: AxiosGetRequest;
    $patchRequest: AxiosPatchRequest;
    $deleteRequest: AxiosDeleteRequest;
  }
}
