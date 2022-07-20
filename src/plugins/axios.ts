import axios from "axios";
import { Plugin } from "vue";
import {
  AxiosGetRequest,
  AxiosDeleteRequest,
  AxiosPatchRequest,
  AxiosPostRequest,
} from "~/types/Axios";

export const axiosPlugin: Plugin = {
  install(app, options) {
    const axiosTransporter = axios.create({
      baseURL: "http://localhost:8080",
      withCredentials: true,
    });

    app.config.globalProperties.$postRequest = axiosTransporter.post;
    app.config.globalProperties.$getRequest = axiosTransporter.get;
    app.config.globalProperties.$deleteRequest = axiosTransporter.delete;
    app.config.globalProperties.$patchRequest = axiosTransporter.patch;
  },
};

declare module "vue" {
  interface ComponentCustomProperties {
    $postRequest: AxiosPostRequest;
    $getRequest: AxiosGetRequest;
    $patchRequest: AxiosPatchRequest;
    $deleteRequest: AxiosDeleteRequest;
  }
}
