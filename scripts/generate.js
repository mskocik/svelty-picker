import { fileURLToPath } from 'node:url';
import { get_documentation_data } from '../src/utils/examples.js';
import { mkdir, writeFile } from 'node:fs/promises';

const {structure, pageComponents } = await get_documentation_data(
	fileURLToPath(new URL('../src/documentation', import.meta.url))
);

try {
	await mkdir(new URL('../src/routes/_generated/', import.meta.url), { recursive: true });
} catch {}

writeFile(
	new URL('../src/routes/_generated/data.js', import.meta.url),
	`export default ${JSON.stringify(structure)}`
);

writeFile(
	new URL('../src/documentation/factory.js', import.meta.url),
	`export const factory = {
${pageComponents
	.map(({ slug, component}) => `  '${slug || 'home'}': async () => (await (import('./${component}'))).default`)
	.join(',\n')
}
	}`
)
