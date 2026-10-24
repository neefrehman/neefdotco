import { bindings, defineConfig, exports } from "cf/config";

export default defineConfig({
  worker: {
    name: "mousecatcher",
    compatibilityDate: "2024-02-26",
    domains: ["mousecatcher.neef.co"],
    entrypoint: "src/index.ts",
    exports: {
      MouseCatcher: exports.durableObject({ storage: "sqlite" }),
    },
    env: {
      Main: bindings.durableObject({
        worker: "mousecatcher",
        exportName: "MouseCatcher",
      }),
    },
  },
});
