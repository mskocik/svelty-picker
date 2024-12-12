import { defineConfig } from "vitest/config";
import { sveltekit } from '@sveltejs/kit/vite';
import {svelteTesting} from '@testing-library/svelte/vite'

export default defineConfig({
  plugins: [sveltekit(), svelteTesting()],
  optimizeDeps: {
    include: ['@floating-ui/dom']
  },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.{test,spec,test.svelte}.{js,ts}'],
    setupFiles: ['test/vitest-setup.js'],
    // browser: {
    //   enabled: true,
    //   provider: 'playwright',
    //   name: 'firefox',
    // }
  }
});
