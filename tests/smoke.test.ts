import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('project setup', () => {
  it('global.css starts with the Tailwind import and defines theme tokens', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css.startsWith('@import "tailwindcss";')).toBe(true);
    expect(css).toContain('@theme');
    expect(css).toContain('--color-paper:');
  });
});
