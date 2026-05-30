import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  server: {
    port: 5173,
    host: true
  },
  resolve: {
    tsconfigPaths: true
  },
  build: {
    chunkSizeWarningLimit: 10000
  },
  plugins: [
    TanStackRouterVite(),
    react()
  ]
});
