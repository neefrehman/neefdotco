import netlify from "@astrojs/netlify";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import compress from "@playform/compress";

export default defineConfig({
  output: "static",
  site: "https://neef.co",
  adapter: netlify({ imageCDN: false }),
  vite: {
    plugins: [tailwindcss()],
  },
  experimental: {
    preserveScriptOrder: true,
  },
  integrations: [
    compress({
      Image: false,
      HTML: {
        "html-minifier-terser": {
          minifyCSS: false,
          collapseWhitespace: false,
        },
      },
      CSS: {
        csso: false,
      },
    }),
  ],
});