import { defineStore } from "pinia";
import { User } from "@prisma/client";

type ClientUser = Omit<User, "passwordHash">;

export const useUserStore = defineStore("user", {
  state() {
    const out: ClientUser = {
      email: "",
      name: "",
      id: 0,
      isActive: false,
      isAdmin: false,
    };
    return out;
  },
  actions: {
    SET_CURRENT_USER({ email, name, id, isActive, isAdmin }: ClientUser) {
      this.email = email;
      this.name = name;
      this.id = id;
      this.isActive = isActive;
      this.isAdmin = isAdmin;
    },
    async ATTEMPT_LOGIN() {
      const { data } = await this.$getRequest("/auth/user");

      if (data) this.SET_CURRENT_USER(data);
    },
    LOGOUT() {
      this.$postRequest("/auth/logout");
      this.SET_CURRENT_USER({
        email: "",
        id: 0,
        name: "",
        isActive: false,
        isAdmin: false,
      });
    },
  },
  getters: {
    CURRENT_USER_IS_LOGGED_IN(): boolean {
      return this.id > 0;
    },
  },
});
