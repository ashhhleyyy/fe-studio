import { deprecations } from "sass";
import { defineConfig } from "vite";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          // for some reason using just the IDs makes typescript unhappy
          deprecations["import"],
          deprecations["mixed-decls"],
          deprecations["color-functions"],
          deprecations["global-builtin"],
          deprecations["if-function"],
        ],
      },
    },
  },
}));
