import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "prisma-type": path.resolve(__dirname, "../type/Prisma")
    }
  }
})