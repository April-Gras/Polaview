<script lang="ts" setup>
import { EntityAddtionRequestSummary } from "~/types/RouteLibraryScraper";

defineEmits<{
  (e: "update-addition-request", value: EntityAddtionRequestSummary): void;
}>();
</script>
<script lang="ts">
import { defineComponent } from "vue";

import OngoingAdditionRequestVue from "@/components/cards/additionRequestCards/OngoingAdditionRequest.vue";
import VButtonMainVue from "@/components/ui/VButtonMain.vue";
import VTextInputVue from "@/components/ui/VTextInput.vue";

import type { PropType } from "vue";

export default defineComponent({
  components: {
    OngoingAdditionRequestVue,
    VButtonMainVue,
    VTextInputVue,
  },
  props: {
    requests: {
      type: Array as PropType<EntityAddtionRequestSummary[]>,
      required: true,
    },
  },
  data() {
    return {
      searchValue: "",
      searchValueTimeout: null as null | number,
    };
  },
  computed: {
    results(): EntityAddtionRequestSummary[] {
      if (!this.searchValue.length) return this.requests;
      return this.requests.filter(({ searchResult }) => {
        return searchResult.name.toLowerCase().includes(this.searchValue);
      });
    },
  },
  methods: {
    handleTextInput(value: string) {
      if (this.searchValueTimeout) clearTimeout(this.searchValueTimeout);
      this.searchValueTimeout = window.setTimeout(() => {
        this.searchValue = value;
        this.searchValueTimeout = null;
      }, 450);
    },
  },
});
</script>
<template>
  <div>
    <RouterLink to="/requests/import">
      <VButtonMainVue>{{
        $t("pages.requestAddition.button.makeNewRequest")
      }}</VButtonMainVue>
    </RouterLink>
    <VTextInputVue
      :model-value="searchValue"
      @update:model-value="handleTextInput"
      label-for-uid="search-for-ongoing"
    />
    <TransitionGroup
      name="list"
      tag="ul"
      class="grid grid-cols-1 gap-4 xl:grid-cols-2"
    >
      <OngoingAdditionRequestVue
        v-for="request in results"
        :request="request"
        :key="request.id"
        @update-addition-request="$emit('update-addition-request', $event)"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
