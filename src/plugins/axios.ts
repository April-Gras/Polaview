import "pinia";
import { PiniaPluginContext } from "pinia";
import { Plugin, markRaw } from "vue";
import {
  AxiosGetRequest,
  AxiosDeleteRequest,
  AxiosPatchRequest,
  AxiosPostRequest,
  AxiosScraperPostRequest,
  AxiosScraperGetRequest,
} from "~/types/Axios";
import {
  serverApiTransporter,
  scraperTransporter,
} from "@/utils/axiosTransporters";

// Vue3 Plugin
export const axiosPlugin: Plugin = {
  install(app) {
    app.config.globalProperties.$postRequest = serverApiTransporter.post;
    app.config.globalProperties.$getRequest = serverApiTransporter.get;
    app.config.globalProperties.$deleteRequest = serverApiTransporter.delete;
    app.config.globalProperties.$patchRequest = serverApiTransporter.patch;
    app.config.globalProperties.$postScraperRequest = scraperTransporter.post;
    app.config.globalProperties.$getScraperRequest = scraperTransporter.get;
  },
};

declare module "vue" {
  interface ComponentCustomProperties {
    $postRequest: AxiosPostRequest;
    $getRequest: AxiosGetRequest;
    $patchRequest: AxiosPatchRequest;
    $deleteRequest: AxiosDeleteRequest;
    $postScraperRequest: AxiosScraperPostRequest;
    $getScraperRequest: AxiosScraperGetRequest;
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
  store.$postScraperRequest = markRaw(scraperTransporter.post);
  // @ts-ignore
  store.$getScraperRequest = markRaw(scraperTransporter.get);
}

declare module "pinia" {
  export interface PiniaCustomProperties {
    $postRequest: AxiosPostRequest;
    $getRequest: AxiosGetRequest;
    $patchRequest: AxiosPatchRequest;
    $deleteRequest: AxiosDeleteRequest;
    $postScraperRequest: AxiosScraperPostRequest;
    $getScraperRequest: AxiosScraperGetRequest;
  }
}
