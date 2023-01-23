import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only'
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';

export default [
  defineConfig({
    input: "src/lib/index.js",
    output: {
      file: 'dist/svelty-picker.js',
      format: 'es'
    },
    plugins: [
      svelte(),
      css({
        output: 'svelty-picker.css'
      }),
      resolve({
        browser: true
      }),
      !process.env.ROLLUP_WATCH && terser()
    ]
  }),
  defineConfig({
    input: "src/lib/index.js",
    output: {
      file: 'dist/svelty-picker-full.js',
      format: 'es'
    },
    plugins: [
      svelte({
        emitCss: false
      }),
      resolve({
        browser: true
      }),
      !process.env.ROLLUP_WATCH && terser()
    ]

  })
];