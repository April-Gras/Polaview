import "pinia";
import { PiniaPluginContext } from "pinia";
import { Plugin, markRaw } from "vue";
import {
  AxiosGetRequest,
  AxiosDeleteRequest,
  AxiosPatchRequest,
  AxiosPostRequest,
  AxiosDataLayerPostRequest,
  AxiosDataLayerGetRequest,
  AxiosDataLayerPatchRequest,
} from "~/types/Axios";
import {
  authLayerApiTransporter,
  dataLayerTransporter,
} from "@/utils/axiosTransporters";

// Vue3 Plugin
export const axiosPlugin: Plugin = {
  install(app) {
    app.config.globalProperties.$postRequest = authLayerApiTransporter.post;
    app.config.globalProperties.$getRequest = authLayerApiTransporter.get;
    app.config.globalProperties.$deleteRequest = authLayerApiTransporter.delete;
    app.config.globalProperties.$patchRequest = authLayerApiTransporter.patch;
    app.config.globalProperties.$postDataLayerRequest =
      dataLayerTransporter.post;
    app.config.globalProperties.$getDataLayerRequest = dataLayerTransporter.get;
    app.config.globalProperties.$patchDataLayerRequest =
      dataLayerTransporter.patch;
  },
};

declare module "vue" {
  interface ComponentCustomProperties {
    $postRequest: AxiosPostRequest;
    $getRequest: AxiosGetRequest;
    $patchRequest: AxiosPatchRequest;
    $deleteRequest: AxiosDeleteRequest;
    $postDataLayerRequest: AxiosDataLayerPostRequest;
    $getDataLayerRequest: AxiosDataLayerGetRequest;
    $patchDataLayerRequest: AxiosDataLayerPatchRequest;
  }
}

// Pinia pluin
export function axiosPiniaPlugin({ store }: PiniaPluginContext) {
  store.$postRequest = markRaw(authLayerApiTransporter.post);
  store.$patchRequest = markRaw(authLayerApiTransporter.patch);
  // @ts-expect-error
  store.$getRequest = markRaw(authLayerApiTransporter.get);
  store.$postDataLayerRequest = markRaw(dataLayerTransporter.post);
  // @ts-expect-error
  store.$getDataLayerRequest = markRaw(dataLayerTransporter.get);
  store.$patchDataLayerRequest = markRaw(dataLayerTransporter.patch);
}

declare module "pinia" {
  export interface PiniaCustomProperties {
    $postRequest: AxiosPostRequest;
    $getRequest: AxiosGetRequest;
    $patchRequest: AxiosPatchRequest;
    $deleteRequest: AxiosDeleteRequest;
    $postDataLayerRequest: AxiosDataLayerPostRequest;
    $getDataLayerRequest: AxiosDataLayerGetRequest;
    $patchDataLayerRequest: AxiosDataLayerPatchRequest;
  }
}
