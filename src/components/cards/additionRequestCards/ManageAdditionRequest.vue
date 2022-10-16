<script lang="ts" setup>
import { EntityAddtionRequestStatus } from "~/types/EntityAddtionRequest";
import { formatDateEllapsed } from "@/utils/dates";

import type { EntityAddtionRequestSummary } from "~/types/RouteLibraryDataLayer";

defineEmits<{
  (e: "update-addition-request", value: EntityAddtionRequestSummary): void;
}>();
</script>
<script lang="ts">
import { defineComponent } from "vue";

import CommonTemplate from "./CommonTemplate.vue";
import RequestAdditionStatusVue from "@/components/ui/RequestAdditionStatus.vue";
import VMainButtonVue from "@/components/ui/VButtonMain.vue";

import type { PropType } from "vue";

export default defineComponent({
  components: {
    CommonTemplate,
    RequestAdditionStatusVue,
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
  methods: {
    handleStatusChangeClick() {
      const nextStatus = this.getNextStatusForPatchRequest();

      if (!nextStatus || this.loading) return;
      this.loading = true;
      this.$patchDataLayerRequest(`/request/${this.request.id.toString()}`, {
        status: nextStatus,
      })
        .then(({ data: singleRequest }) => {
          this.$emit("update-addition-request", {
            ...singleRequest,
            searchResult: this.request.searchResult,
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getNextStatusForPatchRequest() {
      switch (this.request.status) {
        case EntityAddtionRequestStatus.pending:
          return EntityAddtionRequestStatus.ongoing;
        case EntityAddtionRequestStatus.ongoing:
          return EntityAddtionRequestStatus.finalized;
        case EntityAddtionRequestStatus.finalized:
          return EntityAddtionRequestStatus.pending;
      }
    },
  },
});
</script>

<template>
  <CommonTemplate
    :picture-alt="request.searchResult.name"
    :picture-url="request.searchResult.image_url"
  >
    <div class="grid w-full gap-2 py-6 pr-6">
      <h2 class="subtitle-text ellipsis">{{ request.searchResult.name }}</h2>
      <div class="flex w-full items-center justify-between gap-2">
        <div class="grid items-center gap-2">
          <RequestAdditionStatusVue :request="request" />
          <div>{{ formatDateEllapsed(request.updatedOn, $i18n.locale) }}</div>
        </div>
        <div class="grid gap-1 sm:flex">
          <VMainButtonVue
            :class="{
              'bg-request-addition-pending':
                request.status === EntityAddtionRequestStatus.finalized,
              'bg-request-addition-ongoing':
                request.status === EntityAddtionRequestStatus.pending,
              'bg-request-addition-finalized':
                request.status === EntityAddtionRequestStatus.ongoing,
            }"
            @action="handleStatusChangeClick"
          >
            {{ $t("common.go") }}
          </VMainButtonVue>
        </div>
      </div>
    </div>
  </CommonTemplate>
</template>
