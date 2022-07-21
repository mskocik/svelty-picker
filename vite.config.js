import { sveltekit } from '@sveltejs/kit/vite';
import WindiCss from 'vite-plugin-windicss';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), WindiCss()]
};

export default config;
