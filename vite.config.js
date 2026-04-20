import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: "dist/stats.html",
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (
            id.includes("@supabase/") ||
            id.includes("@supabase\\") ||
            id.includes("@supabase-js")
          ) {
            return "supabase";
          }

          if (id.includes("@stripe/")) {
            return "stripe";
          }

          if (id.includes("react-router")) {
            return "router";
          }

          if (id.includes("react-dom") || id.includes("/react/")) {
            return "react-vendor";
          }

          return "vendor";
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
