<script lang="ts">
import { defineComponent } from "vue";

import VPillVue from "@/components/ui/VPill.vue";
import VLazyPictureVue from "@/components/ui/VLazyPicture.vue";

import { thumbnailifyTvDbImage } from "@/utils/thumbnailifyTvDbImage";

import type { PropType } from "vue";
import type { SearchResult } from "@prisma/client";
import type { TranslateResult } from "vue-i18n";

export default defineComponent({
  components: {
    VPillVue,
    VLazyPictureVue,
  },
  props: {
    result: {
      type: Object as PropType<SearchResult>,
      required: true,
    },
  },
  methods: {
    thumbnailifyTvDbImage,
  },
  computed: {
    entityTypeText(): TranslateResult {
      if (this.result.id.includes("movie")) return this.$t("common.movie");
      return this.$t("common.serie");
    },
  },
});
</script>

<template>
  <li
    class="relative flex overflow-hidden rounded-r-lg border border-gray-300 bg-gray-200 shadow dark:border-slate-600 dark:bg-slate-700"
  >
    <div
      class="relative h-40 w-[100px] flex-shrink-0 overflow-hidden rounded-r-lg object-cover object-center shadow"
    >
      <VLazyPictureVue
        :picture-url="result.image_url"
        :picture-alt="result.name"
      />
    </div>
    <div class="relative overflow-hidden p-4">
      <h6 v-once class="subtitle-text ellipsis">{{ result.name }}</h6>
      <VPillVue class="w-fit">{{ entityTypeText }}</VPillVue>
    </div>
  </li>
</template>
