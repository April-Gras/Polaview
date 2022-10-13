<script lang="ts">
import { defineComponent } from "vue";

import IconAndLinkCardVue from "@/components/cards/IconAndLinkCard.vue";

export default defineComponent({
  components: {
    IconAndLinkCardVue,
  },
  data() {
    return {};
  },
});
</script>

<template>
  <div class="grid grid-cols-1 gap-10">
    <h1 class="title-text">{{ $t("pages.admin.title") }}</h1>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <IconAndLinkCardVue to="/admin/user" material-icon="group">
        {{ $t("pages.admin.root.textLink.user") }}
      </IconAndLinkCardVue>
      <IconAndLinkCardVue to="/admin/requests" material-icon="add_task">
        {{ $t("pages.admin.root.textLink.requests") }}
      </IconAndLinkCardVue>
    </div>
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <KeepAlive>
          <component :is="Component" />
        </KeepAlive>
      </transition>
    </RouterView>
  </div>
</template>
