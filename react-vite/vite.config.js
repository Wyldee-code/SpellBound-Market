import { defineConfig } from "vite";
import eslintPlugin from "vite-plugin-eslint";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      eslintPlugin({
        lintOnStart: true,
        failOnWarning: false,      // prevent build fail on warnings
        failOnError: false,        // ✅ don't fail the build on errors
        cache: false,              // ensures it checks freshly every time
      }),
    ],
    server: {
      port: 5174,
      open: true,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:9000",
          changeOrigin: true,
        },
      },
    },
  };
});
