import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./pkg/index.ts"],
  format: ["cjs", "esm"],
  splitting: false,
  sourcemap: false,
  clean: true,
  bundle: true,
  dts: true,
  minify: true,
  minifyWhitespace: true,
});
