import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { stops } from '../src/data/stops.ts';

const root = process.cwd();
const dist = join(root, 'dist');
const errors = [];
const notes = [];

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

function filesIn(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((f) => statSync(join(dir, f)).isFile()) : [];
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

// walks.ts imports geo.ts without a file extension, which Node's ESM loader cannot resolve, so read slugs from source.
function walkSlugs() {
  const src = readFileSync(join(root, 'src', 'data', 'walks.ts'), 'utf8');
  const list = src.slice(src.indexOf('export const walks'));
  return [...list.matchAll(/^\s{4}slug:\s*['"]([^'"]+)['"]/gm)].map((m) => m[1]);
}

function checkPage(rel) {
  const file = join(dist, rel);
  if (existsSync(file)) notes.push(`page ${rel.replace(/\\/g, '/')} ${kb(statSync(file).size)}`);
  else errors.push(`${rel.replace(/\\/g, '/')} is missing`);
}

if (!existsSync(dist)) {
  errors.push('dist/ does not exist; run npm run build first');
} else {
  const astroDir = join(dist, '_astro');
  const assets = filesIn(astroDir);

  const css = assets.filter((f) => f.endsWith('.css'));
  if (css.length === 0) errors.push('dist/_astro contains no CSS file');
  for (const f of css) notes.push(`css  _astro/${f} ${kb(statSync(join(astroDir, f)).size)}`);

  const js = assets.filter((f) => f.endsWith('.js'));
  const leafletJs = js.filter((f) => readFileSync(join(astroDir, f), 'utf8').toLowerCase().includes('leaflet'));
  if (leafletJs.length === 0) errors.push('no JS file in dist/_astro contains "leaflet"');
  for (const f of js) {
    const tag = leafletJs.includes(f) ? ' (leaflet)' : '';
    notes.push(`js   _astro/${f} ${kb(statSync(join(astroDir, f)).size)}${tag}`);
  }

  checkPage('index.html');
  checkPage(join('credits', 'index.html'));
  const slugs = walkSlugs();
  if (slugs.length === 0) errors.push('could not read any walk slugs from src/data/walks.ts');
  for (const slug of slugs) checkPage(join('walks', slug, 'index.html'));

  const html = walk(dist).filter((f) => f.endsWith('.html'));
  const referenced = new Set();
  for (const f of html) {
    for (const m of readFileSync(f, 'utf8').matchAll(/\/then\/[A-Za-z0-9_-]+\.webp/g)) referenced.add(m[0]);
  }
  const missingRefs = [...referenced].filter((src) => !existsSync(join(dist, src)));
  if (missingRefs.length) errors.push(`then pictures referenced in HTML but missing from dist: ${missingRefs.join(', ')}`);

  const declared = stops.filter((s) => s.then).map((s) => s.then.src);
  const missingDeclared = declared.filter((src) => !existsSync(join(dist, src)));
  if (missingDeclared.length) errors.push(`then pictures declared in stops.ts missing from dist: ${missingDeclared.join(', ')}`);

  const thenBytes = [...referenced]
    .filter((src) => existsSync(join(dist, src)))
    .reduce((sum, src) => sum + statSync(join(dist, src)).size, 0);
  notes.push(`then ${referenced.size} pictures referenced in ${html.length} HTML pages, all present (${kb(thenBytes)} total)`);

  const total = walk(dist).reduce((sum, f) => sum + statSync(f).size, 0);
  notes.push(`dist ${walk(dist).length} files, ${kb(total)} total (${relative(root, dist)})`);
}

for (const n of notes) console.log(`ok   ${n}`);
if (errors.length) {
  for (const e of errors) console.error(`FAIL ${e}`);
  process.exit(1);
}
console.log('verify-dist: all checks passed');
