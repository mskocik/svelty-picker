export const factory = {
  'home': async () => (await (import('./00-getting-started/00-introduction/page.svx'))).default,
  'hello-world': async () => (await (import('./01-use-cases/00-hello-world/page.svx'))).default,
  'dynamic-attributes': async () => (await (import('./01-use-cases/01-dynamic-attributes/page.svx'))).default,
  'styling': async () => (await (import('./01-use-cases/02-styling/page.svx'))).default,
  'nested-components': async () => (await (import('./01-use-cases/03-nested-components/page.svx'))).default,
  'html-tags': async () => (await (import('./01-use-cases/04-html-tags/page.svx'))).default
	}