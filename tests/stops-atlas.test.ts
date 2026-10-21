import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { stops } from '../src/data/stops';

// The Atlas repo is only present on the author's machine; CI and Netlify skip this check.
const ATLAS_LANDMARKS = 'C:/Users/neemi/govan/src/data/landmarks.ts';

describe.skipIf(!existsSync(ATLAS_LANDMARKS))('stop text matches The Govan Atlas verbatim', () => {
  it.each(stops.map((s) => [s.slug, s] as const))('%s', async (slug, stop) => {
    const { landmarks } = await import(/* @vite-ignore */ pathToFileURL(ATLAS_LANDMARKS).href);
    const atlas = landmarks.find((l: { slug: string }) => l.slug === slug);
    expect(atlas, `Atlas has ${slug}`).toBeDefined();
    expect(stop.name).toBe(atlas.name);
    expect(stop.era).toBe(atlas.era);
    expect(stop.tagline).toBe(atlas.tagline);
    expect(stop.story).toEqual(atlas.story);
    expect(stop.quickFacts).toEqual(atlas.quickFacts);
  });
});
