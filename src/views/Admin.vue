<script lang="ts">
import { defineComponent } from "vue";
import { User } from "@prisma/client";

import VButtonMainVue from "@/components/ui/VButtonMain.vue";

type UserAlias = Omit<User, "passwordHash">;

export default defineComponent({
  components: {
    VButtonMainVue,
  },
  data() {
    return {
      users: [] as UserAlias[],
      pageSize: 25 as const,
    };
  },
  async created() {
    const { data } = await this.$getRequest("/user");
    this.users = data;
  },
  methods: {
    async handleToggleIsActive(userId: number) {
      const { data } = await this.$postRequest("/user/toggleIsActivate", {
        id: userId,
      });
      const oldVersionId = this.users.findIndex((user) => user.id === data.id);

      this.users.splice(oldVersionId, 1, data);
    },
  },
});
</script>

<template>
  <div class="grid grid-cols-1 gap-6">
    <h1 class="title-text">{{ $t("pages.admin.title") }}</h1>
    <ul class="grid gap-6">
      <li
        v-for="{ name, email, isAdmin, isActive, id } in users"
        class="tableGrid"
      >
        <div>{{ name }}</div>
        <div class="hidden md:block">{{ email }}</div>
        <div
          class="booleanIcon"
          :class="{ 'bg-green-500': isAdmin, 'bg-red-500': !isAdmin }"
        >
          <span class="material-symbols-outlined" v-if="isAdmin"> check </span>
          <span class="material-symbols-outlined" v-else> close </span>
        </div>
        <button
          class="booleanIcon"
          :class="{ 'bg-green-500': isActive, 'bg-red-500': !isActive }"
        >
          <transition name="fade" mode="out-in">
            <span class="material-symbols-outlined" v-if="isActive">
              check
            </span>
            <span class="material-symbols-outlined" v-else> close </span>
          </transition>
        </button>
        <VButtonMainVue @action="handleToggleIsActive(id)">
          Toggle
        </VButtonMainVue>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.booleanIcon {
  @apply flex h-6 w-6 items-center justify-center overflow-hidden rounded-full transition-colors duration-150 ease-in-out;
}

.tableGrid {
  @apply grid items-center gap-4 rounded-sm border border-solid border-slate-100 py-2 px-4;

  grid-template-columns: auto theme("space.6") theme("space.6");

  @screen md {
    grid-template-columns: 25% 25% theme("space.6") theme("space.6") auto;
  }
}
</style>
