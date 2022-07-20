import { createI18n } from "vue-i18n";

import en from "@/locales/en.json";
import fr from "@/locales/fr.json";

export const i18nPlugin = createI18n({
  locale: "en",
  messages: {
    en,
    fr,
  },
});
