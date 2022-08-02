import "pinia";
import { PiniaPluginContext } from "pinia";
import { Plugin, markRaw } from "vue";
import {
  AxiosGetRequest,
  AxiosDeleteRequest,
  AxiosPatchRequest,
  AxiosPostRequest,
  AxiosScrapperPostRequest,
  AxiosScrapperGetRequest,
} from "~/types/Axios";
import {
  serverApiTransporter,
  scrapIdmdbTransporter,
} from "~/axiosTransporters/index";

// Vue3 Plugin
export const axiosPlugin: Plugin = {
  install(app) {
    app.config.globalProperties.$postRequest = serverApiTransporter.post;
    app.config.globalProperties.$getRequest = serverApiTransporter.get;
    app.config.globalProperties.$deleteRequest = serverApiTransporter.delete;
    app.config.globalProperties.$patchRequest = serverApiTransporter.patch;
    app.config.globalProperties.$postScrapImdbRequest =
      scrapIdmdbTransporter.post;
    app.config.globalProperties.$getScrapImdbRequest =
      scrapIdmdbTransporter.get;
  },
};

declare module "vue" {
  interface ComponentCustomProperties {
    $postRequest: AxiosPostRequest;
    $getRequest: AxiosGetRequest;
    $patchRequest: AxiosPatchRequest;
    $deleteRequest: AxiosDeleteRequest;
    $postScrapImdbRequest: AxiosScrapperPostRequest;
    $getScrapImdbRequest: AxiosScrapperGetRequest;
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
  // @ts-ignore
  store.$getScrapImdbRequest = markRaw(scrapIdmdbTransporter.get);
}

declare module "pinia" {
  export interface PiniaCustomProperties {
    $postRequest: AxiosPostRequest;
    $getRequest: AxiosGetRequest;
    $patchRequest: AxiosPatchRequest;
    $deleteRequest: AxiosDeleteRequest;
    $postScrapImdbRequest: AxiosScrapperPostRequest;
    $getScrapImdbRequest: AxiosScrapperGetRequest;
  }
}
