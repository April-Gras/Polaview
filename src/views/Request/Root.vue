<script lang="ts">
import { defineComponent } from "vue";

import type { EntityAddtionRequestSummary } from "~/types/RouteLibraryScraper";

export default defineComponent({
  data() {
    return {
      ongoingRequests: [] as EntityAddtionRequestSummary[],
    };
  },
  created() {
    this.$getScraperRequest("/requests").then(({ data: requests }) => {
      this.ongoingRequests = requests;
      if (!requests.length) this.$router.push("/requests/import");
      else this.$router.push("/requests/explore");
    });
  },
  methods: {
    handleUpdateAdditionRequest(request: EntityAddtionRequestSummary) {
      const entityIndex = this.ongoingRequests.findIndex(
        (e) => e.id === request.id
      );

      if (entityIndex === -1) this.ongoingRequests.unshift(request);
      else this.ongoingRequests[entityIndex] = request;
      if (this.$route.path !== "/requests/explore")
        this.$router.push("/requests/explore");
    },
  },
});
</script>

<template>
  <div class="grid grid-cols-1 gap-10">
    <header class="grid grid-cols-1 gap-4">
      <h1 class="title-text">{{ $t("pages.requestAddition.title") }}</h1>
      <h3 class="subtitle-text">{{ $t("pages.requestAddition.subtitle") }}</h3>
    </header>
    <RouterView class="grid grid-cols-1 gap-10" v-slot="{ Component }">
      <Transition mode="out-in" name="fade">
        <KeepAlive>
          <component
            @update-addition-request="handleUpdateAdditionRequest"
            :is="Component"
            :requests="ongoingRequests"
          />
        </KeepAlive>
      </Transition>
    </RouterView>
  </div>
</template>
