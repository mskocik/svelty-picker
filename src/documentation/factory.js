export const factory = {
  'home': async () => (await (import('./00-introduction/page.svx'))).default,
  'properties': async () => (await (import('./01-properties/page.svx'))).default,
  'principles': async () => (await (import('./02-principles/page.svx'))).default,
  'formatting': async () => (await (import('./03-formatting/page.svx'))).default,
  'auto-commit': async () => (await (import('./04-auto-commit/page.svx'))).default,
  'disabling-dates': async () => (await (import('./04-disabling-dates/page.svx'))).default,
  'slots': async () => (await (import('./05-slots/page.svx'))).default,
  'events': async () => (await (import('./06-events/page.svx'))).default,
  'theme': async () => (await (import('./07-theme/page.svx'))).default,
  'localization': async () => (await (import('./08-localization/page.svx'))).default,
  'global-config': async () => (await (import('./10-global-config/page.svx'))).default
	}