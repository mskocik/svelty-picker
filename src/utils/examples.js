import { CONTENT_BASE_PATHS } from '../constants.js';
import { compile } from 'mdsvex';

export function get_page(data, slug) {
	for (const page of data) {
		if (page.slug === slug) {
			return page;
		}
	}

	return null;
}

/**
 * @returns {Promise<import('./types').ExamplesData>}
 */
export async function get_documentation_data(base) {
	const { readdir, stat, readFile } = await import('node:fs/promises');

	const structure = [];
	const pageComponents = [];

	for (const subdir of await readdir(base)) {
		let slug =  subdir.split('-').slice(1).join('-');

		if (!(await stat(`${base}/${subdir}`)).isDirectory()) continue;

		const page_dir = `${base}/${subdir}`;

		// Get title for
		const compiledMdsvex = compile(
			await readFile(`${page_dir}/page.svx`, 'utf-8')
		)

		const files = [];
		for (const file of (await readdir(page_dir)).filter(
			(file) => file.endsWith('App.svelte')
		)) {
			files.push({
				name: file,
				type: file.split('.').at(-1),
				content: await readFile(`${page_dir}/${file}`, 'utf-8')
			});
		}

		const frontmatter = (await compiledMdsvex).data.fm;
		if (frontmatter.hasOwnProperty('slug')) slug = frontmatter.slug;
		
		pageComponents.push({ slug, component: `${subdir}/page.svx` });

		structure.push({ title: frontmatter.title, slug, files });
	}

	return {
		structure, pageComponents
	};
}

export function get_navigation(data) {
	return data.map((page) => ({
		title: page.title,
		slug: page.slug
	}));
}
