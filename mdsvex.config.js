import { defineMDSveXConfig as defineConfig } from "mdsvex";
import { createHighlighter } from "@bitmachina/highlighter";
import highlighter from './src/utils/markdown.js';

const config = defineConfig({
  extensions: [".svelte.md", ".md", ".svx"],
  smartypants: {
    dashes: "oldschool",
  },
  highlight: {
    // highlighter: await createHighlighter({ theme: "css-variables" }),
    highlighter: highlighter
  },
  remarkPlugins: [],
  rehypePlugins: [],
});

export default config;
