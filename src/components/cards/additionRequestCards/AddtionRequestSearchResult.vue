<script setup lang="ts">
defineEmits<{
  (e: "select", value: string): void;
}>();
</script>
<script lang="ts">
import { defineComponent } from "vue";

import CommonTemplate from "./CommonTemplate.vue";
import VPillVue from "@/components/ui/VPill.vue";
import VLazyPictureVue from "@/components/ui/VLazyPicture.vue";

import { thumbnailifyTvDbImage } from "@/utils/thumbnailifyTvDbImage";

import type { PropType } from "vue";
import type { SearchResult } from "@prisma/client";
import type { TranslateResult } from "vue-i18n";

export default defineComponent({
  components: {
    CommonTemplate,
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
  <CommonTemplate :picture-url="result.image_url" :picture-alt="result.name">
    <div class="relative overflow-hidden p-4">
      <h6 v-once class="subtitle-text ellipsis">{{ result.name }}</h6>
      <VPillVue class="w-fit">{{ entityTypeText }}</VPillVue>
    </div>
    <button
      @click="$emit('select', result.id)"
      class="ml-auto flex h-full items-center justify-center bg-gray-300 px-4 transition-colors duration-150 ease-in-out hover:bg-gray-100 dark:bg-slate-600 hover:dark:bg-slate-500"
    >
      <span class="material-symbols-outlined"> add </span>
    </button>
  </CommonTemplate>
</template>
