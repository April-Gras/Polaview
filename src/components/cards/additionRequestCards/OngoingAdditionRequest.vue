<script lang="ts" setup>
import type { EntityAddtionRequestSummary } from "~/types/RouteLibraryScraper";
import { formatDateEllapsed } from "@/utils/dates";

defineEmits<{
  (e: "update-addition-request", value: EntityAddtionRequestSummary): void;
}>();
</script>
<script lang="ts">
import { defineComponent } from "vue";

import CommonTemplate from "./CommonTemplate.vue";
import RequestAddtionStatusVue from "@/components/ui/RequestAdditionStatus.vue";

import type { PropType } from "vue";

import { useUserStore } from "@/stores/user";

export default defineComponent({
  components: {
    CommonTemplate,
  },
  props: {
    request: {
      type: Object as PropType<EntityAddtionRequestSummary>,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    USER_ID() {
      const userStore = useUserStore();

      return userStore.$state.id;
    },
    currentUserUpvoted() {
      return this.request.upvoteUserIds.includes(this.USER_ID);
    },
  },
  methods: {
    handleUpvote(_: MouseEvent) {
      if (this.loading) return;

      this.loading = true;
      this.$postScraperRequest("/requests", {
        entityId: this.request.searchResult.id,
      })
        .then(({ data: request }) => {
          this.$emit("update-addition-request", request);
        })
        .finally(() => (this.loading = false));
    },
  },
});
</script>
<template>
  <CommonTemplate
    :picture-url="request.searchResult.image_url"
    :picture-alt="request.searchResult.name"
  >
    <div class="flex w-full justify-between gap-4">
      <div class="grid w-full items-center gap-4">
        <h2 class="subtitle-text entityName">
          {{ request.searchResult.name }}
        </h2>
        <div class="flex-shrink-0 space-y-1">
          <div class="text-sm font-light text-gray-500">
            {{ formatDateEllapsed(request.updatedOn, $i18n.locale) }}
          </div>
          <RequestAddtionStatusVue :request="request" />
        </div>
      </div>
      <button
        @click="handleUpvote"
        class="ml-auto flex h-full items-center justify-center gap-2 bg-gray-300 px-4 transition-colors duration-150 ease-in-out hover:bg-gray-100 dark:bg-slate-600 hover:dark:bg-slate-500"
        :class="{ 'pointer-events-none': currentUserUpvoted }"
      >
        <span class="text-2xl font-bold">{{
          request.upvoteUserIds.length
        }}</span>
        <span
          :class="{
            'text-green-500': currentUserUpvoted,
          }"
          class="material-symbols-outlined font-bold"
        >
          arrow_upward
        </span>
      </button>
    </div>
  </CommonTemplate>
</template>

<style scoped lang="scss">
.entityName {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  width: 100%;
}
</style>
