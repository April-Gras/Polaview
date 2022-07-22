import { defineStore } from "pinia";
import { User } from "@prisma/client";

type ClientUser = Omit<User, "passwordHash">;

export const useUserStore = defineStore("user", {
  state() {
    return {
      email: "",
      name: "",
      id: 0,
    } as ClientUser;
  },
  actions: {
    SET_CURRENT_USER({ email, name, id }: ClientUser) {
      this.email = email;
      this.name = name;
      this.id = id;
    },
    async ATTEMPT_LOGIN() {
      try {
        const { data } = await this.$getRequest("/auth/user");

        if (data) this.SET_CURRENT_USER(data);
      } catch (_) {
        return;
      }
    },
    LOGOUT() {
      this.$postRequest("/auth/logout");
      this.$reset();
      // Reload the app, fuck you don't log off you dummy
      window.location.reload;
    },
  },
  getters: {
    CURRENT_USER_IS_LOGGED_IN(): boolean {
      return this.id > 0;
    },
  },
});
