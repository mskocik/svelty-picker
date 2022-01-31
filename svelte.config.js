import path from 'path';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import preprocess from 'svelte-preprocess';
import slug from 'rehype-slug';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md', '.svx'],
	preprocess: [
		preprocess({
			postcss: {
				plugins: [autoprefixer(), cssnano()]
			}
		}),
		mdsvex({
			extensions: ['.svx', '.md'],
			rehypePlugins: [slug]
		})
	],

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		vite: {
			resolve: {
				alias: {
					$components: path.resolve('./src/components')
				}
			},
			server: {
				fs: {
					allow: ['.']
				}
			}
		}
	}
};

export default config;
