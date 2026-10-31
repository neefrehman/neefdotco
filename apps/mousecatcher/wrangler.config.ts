import { defineWranglerConfig } from "wrangler/experimental-config";

export default defineWranglerConfig({
  dev: {
    port: Number(process.env.PORT),
  },
});
