import { defineConfig } from "astro/config";
import image from "@astrojs/image";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [
    image({
      serviceEntryPoint: "@astrojs/image/sharp",
    }),
    tailwind(),
  ],
  scopedStyleStrategy: "class",
});
