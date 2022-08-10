import adapter from "@sveltejs/adapter-static";
// import preprocess from "svelte-preprocess";
import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js";
import { windi } from "svelte-windicss-preprocess";

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
      emitTypes: true,
      exports: (filepath) => {
        return ['index.js', 'custom-element.js'].some(allowedExport => filepath.includes(allowedExport));
      }
    }
  },

  preprocess: [
    mdsvex(mdsvexConfig),
    windi({})
    // preprocess({
    //   postcss: true,
    // }),
  ],
};

export default config;
