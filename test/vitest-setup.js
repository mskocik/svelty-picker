import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// mocking Element.animate
Element.prototype.animate = vi
  .fn()
  .mockImplementation(() => ({ cancel: vi.fn(), finished: Promise.resolve() }));
