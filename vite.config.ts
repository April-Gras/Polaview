import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import vue from "@vitejs/plugin-vue";

import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      manifest: {
        background_color: "#1e293b",
        theme_color: "#1e293b",
        categories: ["entertainment"],
        description: "Good files for good people",
        icons: [
          {
            src: "/favicon_192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/favicon_258.png",
            sizes: "258x258",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/favicon_512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  server: {
    hmr: {
      port: 3010,
    },
  },
  build: {
    emptyOutDir: true,
  },
  publicDir: "static",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~": path.resolve(__dirname, "./shared"),
    },
  },
});
