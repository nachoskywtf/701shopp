import { defineConfig } from "@lovable.dev/vite-tanstack-config";

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
    {
      name: 'disable-vite-tsconfig-paths',
      enforce: 'pre',
      config(config) {
        if (config.plugins) {
          config.plugins = (config.plugins as any[]).filter(p => !p || p.name !== 'vite-tsconfig-paths');
        }
      }
    }
  ]
});
