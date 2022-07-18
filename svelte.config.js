import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js";
import adapter from "@sveltejs/adapter-static";

const dev = process.env.NODE_ENV === "development";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ...mdsvexConfig.extensions],

  kit: {
    adapter: adapter({
      pages: "docs",
      assets: "docs",
    }),
    trailingSlash: "never",
    prerender: {
      default: true,
    },
    paths: {
      base: dev ? "" : "/svelty-picker",
    },
    package: {
      emitTypes: false,
    },
  },

  preprocess: [mdsvex(mdsvexConfig)],
};

export default config;
