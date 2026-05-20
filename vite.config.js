import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_PROXY_TARGET || "http://127.0.0.1:8080";

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Same-origin in the browser → no CORS. Forwards to Express (see src/config/env.js when VITE_BACKEND_URL is unset in dev).
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
