export const factory = {
  // 00-getting-started/
  '00-introduction': async () => (await (import('./00-getting-started/00-introduction/page.svx'))).default,
  // 00-getting-started/
  '00-hello-world': async () => (await (import('./01-use-cases/00-hello-world/page.svx'))).default,
}