import { tvDbTransporter } from "~/axiosTransporters";
import { AxiosTvDbApiPostRequest, AxiosTvDbApiGetRequest } from "~/types/Axios";

export const tvDbPostRequest: AxiosTvDbApiPostRequest = tvDbTransporter.post;
// @ts-ignore
export const tvDbGetRequest: AxiosTvDbApiGetRequest = (
  url,
  payload,
  config
) => {
  return tvDbTransporter.get(url, {
    ...config,
    params: payload,
  });
};
