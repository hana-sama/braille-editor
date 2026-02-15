import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  server: {
    open: true
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/tests/setup.ts"]
  }
});
