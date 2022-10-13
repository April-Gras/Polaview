<script lang="ts" setup>
import { EntityAddtionRequestSummary } from "~/types/RouteLibraryScraper";

defineEmits<{
  (e: "update-addition-request", value: EntityAddtionRequestSummary): void;
}>();
</script>
<script lang="ts">
import { defineComponent } from "vue";

import AddtionRequestSearchResultVue from "@/components/cards/additionRequestCards/AddtionRequestSearchResult.vue";
import VButtonMainVue from "@/components/ui/VButtonMain.vue";
import VTextInputVue from "@/components/ui/VTextInput.vue";

import type { SearchResult } from "@prisma/client";

export default defineComponent({
  components: {
    AddtionRequestSearchResultVue,
    VButtonMainVue,
    VTextInputVue,
  },
  data() {
    return {
      searchValue: "",
      loading: false,
      searchResults: [] as SearchResult[],
      needSearchValue: false,
      searchMode: "movie" as "movie" | "series",
    };
  },
  methods: {
    lookForEntity(term: string) {
      if (this.loading) return;
      if (!this.searchValue) return (this.searchResults = []);
      this.loading = true;
      this.$postScraperRequest("/searchV2", {
        query: term.toLowerCase(),
        type: this.searchMode,
      })
        .then(({ data: searchResults }) => {
          this.searchResults = searchResults;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    moveSearchMode(mode: "series" | "movie") {
      this.searchMode = mode;
      this.lookForEntity(this.searchValue);
    },
    handleEntitySelect(entityId: string) {
      if (this.loading) return;
      this.loading = true;
      this.$postScraperRequest("/requests", {
        entityId,
      })
        .then(({ data: requestAddition }) => {
          this.$emit("update-addition-request", requestAddition);
        })
        .finally(() => (this.loading = false));
    },
  },
});
</script>

<template>
  <div>
    <RouterLink to="/requests/explore">
      <VButtonMainVue>{{
        $t("pages.requestAddition.button.viewOngoingRequests")
      }}</VButtonMainVue>
    </RouterLink>
    <section class="relative flex gap-4">
      <div class="sheen" :class="{ moved: searchMode === 'series' }" />
      <button class="typeToggle" @click="moveSearchMode('movie')">
        {{ $t("common.movie") }}
      </button>
      <button class="typeToggle" @click="moveSearchMode('series')">
        {{ $t("common.serie") }}
      </button>
    </section>
    <section class="relative grid grid-cols-1 gap-10">
      <article
        class="searchWrapper relative grid w-full items-center justify-between gap-4"
      >
        <VTextInputVue
          v-model="searchValue"
          :placeholder="$t('pages.requestAddition.placeholderSearchInput')"
          label-for-uid="search-for-request"
        />
        <VButtonMainVue
          @action="lookForEntity(searchValue)"
          :disabled="loading"
          >{{ $t("common.go") }}</VButtonMainVue
        >
      </article>
      <article>
        <Transition name="fade" mode="out-in">
          <div
            v-if="loading"
            key="loading"
            class="flex items-center justify-center gap-4"
          >
            <span>{{ $t("common.loading") }}</span>
            <div class="rotatingLoader">
              <span class="material-symbols-outlined"> autorenew </span>
            </div>
          </div>
          <ul
            v-else-if="searchResults.length"
            key="results"
            class="grid grid-cols-1 gap-4 lg:grid-cols-2"
          >
            <AddtionRequestSearchResultVue
              v-for="result in searchResults"
              :key="result.id"
              :result="result"
              @select="handleEntitySelect"
            />
          </ul>
        </Transition>
      </article>
    </section>
  </div>
</template>

<style scoped lang="scss">
@keyframes sugoma {
  from {
    transform: rotate(0deg);
    transform-origin: center;
  }
  to {
    transform: rotate(360deg);
    transform-origin: center;
  }
}

.rotatingLoader {
  @apply flex items-center justify-center;

  animation: sugoma 0.8s infinite ease-in-out;
}

.sheen {
  @apply absolute h-full rounded bg-gradient-to-b from-gray-400 to-gray-300 opacity-25 duration-150 ease-in-out dark:from-slate-700 dark:to-slate-600;

  left: 0%;
  transition-property: left;
  width: calc(50% - theme("space.2"));

  &.moved {
    left: calc(50% + theme("space.2"));
  }
}

.typeToggle {
  @apply w-full p-2;
}

.searchWrapper {
  @apply grid-cols-1;

  @screen xs {
    @apply flex justify-between;
  }
}
</style>
