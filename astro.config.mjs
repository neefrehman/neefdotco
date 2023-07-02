import { defineConfig } from "astro/config";
import image from "@astrojs/image";

import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [
    image({
      serviceEntryPoint: "@astrojs/image/sharp",
    }),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  compressHTML: true,
});
