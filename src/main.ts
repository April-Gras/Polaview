import { createApp } from "vue";
import { createPinia } from "pinia";
import { i18nPlugin } from "@/plugins/i18n";

import { routerPlugin } from "@/plugins/router";
import { axiosPlugin, axiosPiniaPlugin } from "@/plugins/axios";
import "./index.css";

import App from "@/App.vue";

const pinia = createPinia();

const app = createApp(App)
  .use(axiosPlugin)
  .use(pinia)
  .use(routerPlugin)
  .use(i18nPlugin);

pinia.use(axiosPiniaPlugin);

app.mount("#app");
