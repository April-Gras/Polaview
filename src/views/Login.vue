<script lang="ts">
import { defineComponent } from "vue";

import { useUserStore } from "@/stores/user";

import { userLoginValidator } from "~/validators/User";

import VTextInputVue from "@/components/ui/VTextInput.vue";
import VButtonMainVue from "@/components/ui/VButtonMain.vue";

export default defineComponent({
  setup() {
    return {
      USER_STORE: useUserStore(),
    };
  },
  components: {
    VTextInputVue,
    VButtonMainVue,
  },
  data() {
    return {
      email: "",
      password: "",
      validationArray: [] as string[],
    };
  },
  methods: {
    verifyLoginInputs() {
      this.validationArray = userLoginValidator({
        email: this.email,
        clearPassword: this.password,
      });
      return this.validationArray.length === 0;
    },
    async attemptLogin() {
      if (!this.verifyLoginInputs()) return;
      try {
        await this.$postRequest("/auth/login", {
          email: this.email,
          clearPassword: this.password,
        });
        await this.USER_STORE.ATTEMPT_LOGIN();
        this.$router.push("/");
      } catch (err) {
        // TODO handle shit
      }
    },
  },
});
</script>

<template>
  <div class="grid gap-10">
    <div class="grid-col-1 grid w-full gap-4">
      <h1 class="title-text">{{ $t("pages.login.title.Login") }}</h1>
      <VTextInputVue
        v-model="email"
        v-model:validationArray="validationArray"
        validation-key="email"
        label-for-uid="email"
        :placeholder="$t('placeholders.email')"
      >
        <template #label>{{ $t("common.email") }}</template>
        <template #error-message>{{ $t("inputErrors.email") }}</template>
      </VTextInputVue>
      <VTextInputVue
        v-model="password"
        v-model:validationArray="validationArray"
        validation-key="clearPassword"
        input-type="password"
        label-for-uid="password"
        :placeholder="$t('common.password')"
      >
        <template #label>{{ $t("common.password") }}</template>
        <template #error-message>{{ $t("inputErrors.password") }}</template>
      </VTextInputVue>
    </div>
    <div class="flex justify-end">
      <VButtonMainVue @action="attemptLogin">{{
        $t("common.login")
      }}</VButtonMainVue>
    </div>
  </div>
</template>
