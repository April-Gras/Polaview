import axios, { AxiosRequestConfig } from "axios";
import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";

const app = createApp(App);

app.use((app) => {
  const axiosTransporter = axios.create({});
  app.config.globalProperties.postRequest = axiosTransporter.post;
  app.config.globalProperties.getRequest = axiosTransporter.get;
  app.config.globalProperties.deleteRequest = axiosTransporter.delete;
  app.config.globalProperties.patchRequest = axiosTransporter.patch;
});

app.mount("#app");
