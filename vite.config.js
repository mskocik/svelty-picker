import { sveltekit } from '@sveltejs/kit/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default ({ mode }) => {
	return mode === 'ce'
		? defineConfig({
				plugins: [
					svelte({
						emitCss: true
					}),
				],
				build: {
					rollupOptions: {
						output: {
							// file: 'svelty-picker.js',
							format: 'esm',
							exports: 'named'
						},
					},
					outDir: 'ce',
					lib: {
						entry: "src/lib/index.js",
						formats: ['iife'],
						name: 'SveltyPicker',
					}
				},
			})
		: defineConfig({
			plugins: [nodePolyfills({
				protocolImports: false
			}), sveltekit()],

			optimizeDeps: {
				exclude: ['@sveltejs/site-kit', '@sveltejs/repl']
			},
			ssr: { noExternal: ['@sveltejs/site-kit', '@sveltejs/repl'] },
		});
};
