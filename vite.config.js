import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
  },
});
