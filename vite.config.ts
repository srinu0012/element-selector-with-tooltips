import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        // popup: "index.html",
        // background: "src/background.ts",
        content: "src/content.tsx",
      },
      output: {
        format: "esm",
        entryFileNames: "[name].js",
      },
    },
  },
});
