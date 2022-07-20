import { createApp } from "vue";
import { i18nPlugin } from "@/plugins/i18n";

import { axiosPlugin } from "@/plugins/axios";
import { routerPlugin } from "@/plugins/router";

import App from "@/App.vue";
import "@/index.css";

createApp(App).use(axiosPlugin).use(routerPlugin).use(i18nPlugin).mount("#app");
