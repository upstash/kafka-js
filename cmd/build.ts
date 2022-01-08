// ex. scripts/build_npm.ts
import { build } from "https://deno.land/x/dnt/mod.ts";
import { VERSION } from "../version.ts";
await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
    undici: true,
    crypto: true,
  },
  package: {
    // package.json properties
    name: "@chronark/upstash-kafka",
    version: VERSION,
    description: "Serverless kafka client for upstash",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/chronark/upstash-kafka.git",
    },
    bugs: {
      url: "https://github.com/chronark/upstash-kafka/issues",
    },
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
