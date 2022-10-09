<script lang="ts">
import { defineComponent } from "vue";

import VPillVue from "@/components/ui/VPill.vue";

import { thumbnailifyTvDbImage } from "@/utils/thumbnailifyTvDbImage";

import type { PropType } from "vue";
import type { SearchResult } from "@prisma/client";
import type { TranslateResult } from "vue-i18n";

export default defineComponent({
  components: {
    VPillVue,
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
    class="relative flex overflow-hidden rounded-r-lg border border-gray-300 bg-gray-200 shadow dark:border-slate-900 dark:bg-slate-700"
  >
    <img
      v-if="result.image_url"
      :src="thumbnailifyTvDbImage(result.image_url)"
      class="picture"
    />
    <div v-else class="picture" />
    <div class="relative overflow-hidden p-4">
      <h6 v-once class="subtitle-text ellipsis">{{ result.name }}</h6>
      <VPillVue class="w-fit">{{ entityTypeText }}</VPillVue>
    </div>
  </li>
</template>

<style lang="scss" scoped>
.picture {
  @apply h-40 w-[100] flex-shrink-0 overflow-hidden rounded-r-lg object-cover object-center shadow;
}
</style>
