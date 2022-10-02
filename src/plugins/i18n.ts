import { createI18n } from "vue-i18n";

import eng from "@/locales/eng.json";
import fra from "@/locales/fra.json";

export const i18nPlugin = createI18n({
  locale: "eng",
  messages: {
    eng,
    fra,
  },
});
