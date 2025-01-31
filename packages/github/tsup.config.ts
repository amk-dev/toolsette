import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  external: ["zod", "ai"],
  dts: true,
  format: ["esm"],
  clean: true,
});
