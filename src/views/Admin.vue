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
  <div class="relative grid grid-cols-1 gap-6">
    <h1 class="title-text">{{ $t("pages.admin.title") }}</h1>
    <div class="relative w-full space-y-10">
      <div class="tableGrid">
        <span class="ellipsis">{{ $t("pages.admin.table.name") }}</span>
        <span class="ellipsis">{{ $t("pages.admin.table.email") }}</span>
        <span class="ellipsis">{{ $t("pages.admin.table.isAdmin") }}</span>
        <span class="ellipsis">{{ $t("pages.admin.table.isActive") }}</span>
        <span class="ellipsis">{{
          $t("pages.admin.table.toggleIsActive")
        }}</span>
      </div>
      <ul class="grid gap-6">
        <li
          v-for="{ name, email, isAdmin, isActive, id } in users"
          class="tableGrid"
        >
          <div class="ellipsis">{{ name }}</div>
          <div class="ellipsis">{{ email }}</div>
          <div
            class="booleanIcon"
            :class="{ 'bg-green-500': isAdmin, 'bg-red-500': !isAdmin }"
          >
            <span class="material-symbols-outlined text-white" v-if="isAdmin">
              check
            </span>
            <span class="material-symbols-outlined text-white" v-else>
              close
            </span>
          </div>
          <button
            class="booleanIcon"
            :class="{ 'bg-green-500': isActive, 'bg-red-500': !isActive }"
          >
            <transition name="fade" mode="out-in">
              <span
                class="material-symbols-outlined text-white"
                v-if="isActive"
              >
                check
              </span>
              <span class="material-symbols-outlined text-white" v-else>
                close
              </span>
            </transition>
          </button>
          <VButtonMainVue
            @action="handleToggleIsActive(id)"
            class="col-span-2 md:col-span-1"
          >
            Toggle
          </VButtonMainVue>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.booleanIcon {
  @apply flex h-6 w-6 items-center justify-center overflow-hidden rounded-full transition-colors duration-150 ease-in-out;
}

.tableGrid {
  @apply grid w-full grid-cols-2 items-center gap-4 border border-solid border-slate-300 py-2 px-4 dark:border-slate-700 md:grid-cols-4;

  @screen md {
    @apply grid-cols-5;
  }
}
</style>
