import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.ts"],
    exclude: ["node_modules"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "dist/",
      ],
    },
  },
  ssr: {
    noExternal: true,
  },
  resolve: {
    conditions: ["node"],
  },
  esbuild: {
    target: "node18",
  },
});
