import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.evals.ts"],
    testTimeout: 10000,
  },
});
