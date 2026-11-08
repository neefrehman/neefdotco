import netlify from "@astrojs/netlify";
import compress from "@playform/compress";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://neef.co",
  adapter:
    process.env.NODE_ENV === "production"
      ? netlify({
          imageCDN: false,
          devFeatures: {
            images: true,
            environmentVariables: false,
            edgeFunctions: false,
          },
        })
      : undefined,
  prefetch: true,
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
