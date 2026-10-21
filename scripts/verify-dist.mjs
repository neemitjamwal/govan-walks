import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const errors = [];
const notes = [];

function filesIn(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((f) => statSync(join(dir, f)).isFile()) : [];
}

if (!existsSync(dist)) {
  errors.push('dist/ does not exist; run npm run build first');
} else {
  const astroDir = join(dist, '_astro');
  const css = filesIn(astroDir).filter((f) => f.endsWith('.css'));
  if (css.length === 0) {
    errors.push('dist/_astro contains no CSS file');
  } else {
    for (const f of css) notes.push(`css ${f} ${(statSync(join(astroDir, f)).size / 1024).toFixed(1)} KB`);
  }

  if (!existsSync(join(dist, 'index.html'))) errors.push('dist/index.html is missing');
}

for (const n of notes) console.log(`ok   ${n}`);
if (errors.length) {
  for (const e of errors) console.error(`FAIL ${e}`);
  process.exit(1);
}
console.log('verify-dist: all checks passed');
