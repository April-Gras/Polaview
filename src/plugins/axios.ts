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
  AxiosScraperPatchRequest,
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
    app.config.globalProperties.$patchScraperRequest = scraperTransporter.patch;
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
    $patchScraperRequest: AxiosScraperPatchRequest;
  }
}

// Pinia pluin
export function axiosPiniaPlugin({ store }: PiniaPluginContext) {
  store.$postRequest = markRaw(serverApiTransporter.post);
  store.$patchRequest = markRaw(serverApiTransporter.patch);
  // @ts-expect-error
  store.$getRequest = markRaw(serverApiTransporter.get);
  store.$postScraperRequest = markRaw(scraperTransporter.post);
  // @ts-expect-error
  store.$getScraperRequest = markRaw(scraperTransporter.get);
  store.$patchScraperRequest = markRaw(scraperTransporter.patch);
}

declare module "pinia" {
  export interface PiniaCustomProperties {
    $postRequest: AxiosPostRequest;
    $getRequest: AxiosGetRequest;
    $patchRequest: AxiosPatchRequest;
    $deleteRequest: AxiosDeleteRequest;
    $postScraperRequest: AxiosScraperPostRequest;
    $getScraperRequest: AxiosScraperGetRequest;
    $patchScraperRequest: AxiosScraperPatchRequest;
  }
}
