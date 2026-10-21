// Builds the per-stop "then" pictures from two public-domain map scans.
// Usage: node scripts/then-crops.mjs [--previews]
//   --previews also writes PNG copies to .cache/previews/then/ for visual checks.
import { createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { cropWindow, fitAffine, metresPerPixel, residualsMetres, rms, toPixel } from '../src/lib/affine.ts';
import { stops } from '../src/data/stops.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = join(root, 'scripts', 'then-config.json');
const outDir = join(root, 'public', 'then');
const previewDir = join(root, '.cache', 'previews', 'then');
const wantPreviews = process.argv.includes('--previews');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const { crop } = config;
const round = (v, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

async function ensureScan(id, src) {
  const file = join(root, src.cacheFile);
  if (existsSync(file) && statSync(file).size === src.bytes) return file;
  mkdirSync(dirname(file), { recursive: true });
  const url = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(src.commonsFile.replace(/ /g, '_'));
  console.log(`downloading ${id} …`);
  const res = await fetch(url, { headers: { 'User-Agent': config.userAgent }, redirect: 'follow' });
  if (!res.ok || !res.body) throw new Error(`download failed ${res.status} ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(file + '.part'));
  renameSync(file + '.part', file);
  if (statSync(file).size !== src.bytes) throw new Error(`${id}: expected ${src.bytes} bytes, got ${statSync(file).size}`);
  // Commons asks bulk clients to pace requests.
  await new Promise((r) => setTimeout(r, 3000));
  return file;
}

const fits = {};
for (const [id, src] of Object.entries(config.sources)) {
  src.file = await ensureScan(id, src);
  const pts = src.controlPoints;
  if (pts.length < crop.minControlPoints) throw new Error(`${id}: needs >= ${crop.minControlPoints} control points`);
  const fit = fitAffine(pts);
  const res = residualsMetres(fit, pts);
  pts.forEach((p, i) => (p.residualM = round(res[i])));
  src.rmsM = round(rms(res));
  src.metresPerPixel = round(metresPerPixel(fit), 3);
  if (src.rmsM > crop.maxRmsM) throw new Error(`${id}: RMS ${src.rmsM} m exceeds ${crop.maxRmsM} m`);
  const meta = await sharp(src.file, { limitInputPixels: false }).metadata();
  src.size = [meta.width, meta.height];
  fits[id] = fit;
  console.log(`${id}: ${pts.length} control points, RMS ${src.rmsM} m, ${src.metresPerPixel} m/px`);
}

function covered(id, x, y) {
  const a = config.sources[id].mapArea, m = crop.ringRadius + crop.ringWidth;
  return x >= a.left + m && x <= a.right - m && y >= a.top + m && y <= a.bottom - m;
}

function ringSvg(x, y) {
  const r = crop.ringRadius, w = crop.ringWidth;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${crop.width}" height="${crop.height}">` +
      `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${crop.ringOutline}" stroke-width="${w + 4}" stroke-opacity="0.8"/>` +
      `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${crop.ringColor}" stroke-width="${w}"/>` +
      `</svg>`,
  );
}

mkdirSync(outDir, { recursive: true });
if (wantPreviews) mkdirSync(previewDir, { recursive: true });
const scans = {};
const stopEntries = {};
for (const stop of stops) {
  const order = config.stopSourceOverrides?.[stop.slug] ? [config.stopSourceOverrides[stop.slug].source] : config.sourcePreference;
  const id = order.find((s) => {
    const [x, y] = toPixel(fits[s], stop.lat, stop.lng);
    return covered(s, x, y);
  });
  if (!id) {
    stopEntries[stop.slug] = { source: null, reason: 'outside both map scans' };
    console.log(`${stop.slug}: not covered by any source`);
    continue;
  }
  const src = config.sources[id];
  const [x, y] = toPixel(fits[id], stop.lat, stop.lng);
  const { left, top } = cropWindow(x, y, crop.width, crop.height, src.size[0], src.size[1]);
  const rx = round(x - left), ry = round(y - top);
  scans[id] ??= sharp(src.file, { limitInputPixels: false });
  const piece = await scans[id].clone().extract({ left, top, width: crop.width, height: crop.height }).png().toBuffer();
  const ringed = await sharp(piece).composite([{ input: ringSvg(rx, ry) }]).png().toBuffer();
  const out = sharp(ringed).resize(crop.outputWidth);
  const dest = join(outDir, `${stop.slug}.webp`);
  await out.clone().webp({ quality: crop.webpQuality, effort: 6 }).toFile(dest);
  if (wantPreviews) await out.clone().png().toFile(join(previewDir, `${stop.slug}.png`));
  const kb = statSync(dest).size / 1024;
  stopEntries[stop.slug] = { source: id, px: [round(x), round(y)], window: { left, top, width: crop.width, height: crop.height }, ring: [rx, ry], kb: round(kb) };
  console.log(`${stop.slug}: ${id} px ${Math.round(x)},${Math.round(y)} -> ${kb.toFixed(0)} KB`);
}

for (const src of Object.values(config.sources)) delete src.file;
config.stops = stopEntries;
writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
console.log(`then-crops: wrote ${Object.values(stopEntries).filter((s) => s.source).length} pictures to public/then/`);
