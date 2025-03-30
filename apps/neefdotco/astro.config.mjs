import netlify from "@astrojs/netlify";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

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
});
