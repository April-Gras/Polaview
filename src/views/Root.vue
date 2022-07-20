<script setup lang="ts">
import { useRouter } from "vue-router";
</script>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      email: "",
      password: "",
      name: "",
    };
  },
  methods: {
    handleSignupClick(): void {
      this.$postRequest("/user", {
        email: this.email,
        name: this.name,
        clearPassword: this.password,
      })
        .then(({ data }) => {
          console.log({ data });
        })
        .catch((err) => {
          console.error(err);
        });
    },
    handleLoginClick(): void {
      this.$postRequest("/auth/login", {
        email: this.email,
        clearPassword: this.password,
      })
        .then(({ data }) => {
          console.log({ data });
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },
});
</script>

<template>
  <div class="mx-6 my-10 grid grid-cols-1 gap-4">
    <input v-model="email" />
    <input v-model="password" />
    <input v-model="name" />
    <button @click="handleSignupClick">Signup</button>
    <button @click="handleLoginClick">Login</button>
  </div>
</template>
