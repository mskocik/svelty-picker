import adapter from "@sveltejs/adapter-static";
import preprocess from "svelte-preprocess";
import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js";

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
    }
  },

  preprocess: [
    mdsvex(mdsvexConfig),
    preprocess({
      postcss: true,
    }),
  ],
};

export default config;
