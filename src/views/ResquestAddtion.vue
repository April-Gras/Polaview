<script lang="ts">
import { defineComponent } from "vue";

import AddtionRequestSearchResultVue from "@/components/cards/AddtionRequestSearchResult.vue";
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
    };
  },
  methods: {
    lookForEntity(term: string) {
      if (this.loading) return;
      if (!this.searchValue) return (this.searchResults = []);
      this.loading = true;
      this.$postScraperRequest("/searchV2", {
        query: term.toLowerCase(),
      })
        .then(({ data: searchResults }) => {
          this.searchResults = searchResults;
        })
        .finally(() => {
          this.loading = false;
        });
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
    <section class="grid grid-cols-1 gap-10">
      <article class="flex items-center justify-between gap-4">
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
</style>
