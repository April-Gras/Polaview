<script lang="ts">
import { defineComponent } from "vue";

import VTextInputVue from "@/components/ui/VTextInput.vue";
import VButtonMainVue from "@/components/ui/VButtonMain.vue";

import { userValidator } from "~/validators/User";

export default defineComponent({
  components: {
    VTextInputVue,
    VButtonMainVue,
  },
  data() {
    return {
      name: "",
      email: "",
      password: "",
      validationArray: [] as string[],
    };
  },
  methods: {
    attemptSignup() {
      if (!this.validateSignupData()) return;
      this.$postRequest("/user", {
        email: this.email,
        clearPassword: this.password,
        name: this.name,
      });
      this.$router.push("/signup/confirmed");
    },
    validateSignupData(): boolean {
      this.validationArray = userValidator({
        email: this.email.trim(),
        name: this.name,
        clearPassword: this.password,
      });
      return this.validationArray.length === 0;
    },
  },
});
</script>

<template>
  <div class="grid gap-10">
    <div class="grid-col-1 grid w-full gap-4">
      <h1 class="title-text">{{ $t("pages.signup.title") }}</h1>
      <VTextInputVue
        v-model="name"
        v-model:validationArray="validationArray"
        validation-key="name"
        label-for-uid="name"
        :placeholder="$t('placeholders.name')"
      >
        <template #label>{{ $t("common.name") }}</template>
        <template #error-message>{{ $t("inputErrors.name") }}</template>
      </VTextInputVue>
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
      <VButtonMainVue @action="attemptSignup">{{
        $t("common.signup")
      }}</VButtonMainVue>
    </div>
  </div>
</template>
