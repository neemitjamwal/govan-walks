# Govan Walks

Govan Walks is a phone-first website for four self-guided heritage walks around Govan, Glasgow. Open it on your phone, pick a walk and follow the stops. Each stop has:

- a short story copied from [The Govan Atlas](https://github.com/neemitjamwal/govan),
- a "then" picture: a small piece of an old public-domain map, with a ring marking where the stop is today,
- live GPS (only when you press **Start GPS**) showing where you are and the distance and direction to the stop, with an "arrived" state,
- a **Listen** button that reads the stop aloud with the phone's built-in speech.

The site is fully static. It has no server, no accounts, no API keys and no tracking. Your location stays on your device.

## The walks

| Walk | Stops | Route |
| --- | --- | --- |
| **Ancient Govan** (`/walks/ancient-govan/`) | 7 | Govan Cross → Doomster Hill → Water Row → The Govan Ferry → Govan–Partick Bridge → The Old Govan Walkway → Govan Old & the Govan Stones |
| **The Yards** (`/walks/the-yards/`) | 9 | Govan Graving Docks → The Black Man (Sir William Pearce Monument) → The Pearce Institute → St Anthony's Church → The Lyceum → Fairfield Offices & Fairfield Heritage → The Govan Shipyards → The Clyde Tunnel → Linthouse |
| **Isabella Elder's Govan** (`/walks/isabella-elder/`) | 5 | Fairfield Offices & Fairfield Heritage → Elder Park Library → The Isabella Elder Mural → Elder Park → Elder Cottage Hospital |
| **Under the Clyde** (`/walks/under-the-clyde/`) | 4 | Fairfield Offices & Fairfield Heritage → The Govan Shipyards → Linthouse → The Clyde Tunnel → through the pedestrian and cycle tunnel under the river to Whiteinch |

The home page shows each walk's distance, walking time and stop count. These are worked out from the stop positions in `src/data/stops.ts` (straight lines between stops), so the distance you actually walk on the streets will be a little longer.

## Requirements

- Node.js **22.22 or later** (Astro 7 needs it; `package.json` sets `engines.node` to `>=22.22.0`).
- npm 10 or later.

If your system Node is older, you can run any command below under a temporary Node without installing it, for example:

```sh
npx -y -p node@22.22.0 -- npm run build
```

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies. |
| `npm run dev` | Start the Astro dev server with live reload. |
| `npm run build` | Build the static site into `dist/`. |
| `npm run preview` | Serve the built `dist/` locally (for example `npm run preview -- --port 4500`). |
| `npm run test` | Run the Vitest unit tests in `tests/` (geo maths, walk state, GPS view, speech text, data integrity, crop maths). |
| `npm run typecheck` | Type-check the project with `tsc --noEmit`. |
| `npm run verify` | Check the real build output after `npm run build`: CSS and Leaflet JS in `dist/_astro`, the home, credits and every walk page, and every then-picture the pages or `stops.ts` refer to. |
| `npm run then:crops` | Rebuild the then-pictures in `public/then/` (see below). Add `-- --previews` to also write PNG copies to `.cache/previews/then/`. |

## Project layout

```
src/data/stops.ts         Stop records: Atlas text, checked positions, then-picture and credit
src/data/walks.ts         The four walks: ordered stop slugs, theme and intro
src/lib/                  Pure, unit-tested logic (geo, walk state, GPS view, speech, crop maths)
src/scripts/              Browser code for the walk page: map, GPS, Listen
src/components/           Stop list, stop viewer, GPS panel, Listen controls, then-picture, walk card
src/pages/index.astro     Walk picker
src/pages/walks/[walk].astro  One page per walk
src/pages/credits.astro   Sources and licences
scripts/then-crops.mjs    Builds the then-pictures
scripts/then-config.json  Map control points, crop settings and the result for each stop
scripts/verify-dist.mjs   Checks the build output
public/then/              The committed then-pictures (WebP)
```

## How the then-pictures are made

`npm run then:crops` runs `scripts/then-crops.mjs`:

1. It downloads two public-domain map scans from Wikimedia Commons into `.cache/` (git-ignored). It only downloads a scan if it is missing or the wrong size, and it sends a descriptive User-Agent and pauses between downloads.
2. For each map it fits an affine transform from the control points in `scripts/then-config.json` (known landmarks matched between the scan and today's coordinates). It stops with an error if a map has fewer than 4 control points or a fit error (RMS) above 40 m.
3. For each stop it finds the stop's position on the first map that covers it (the Ordnance Survey sheet first, then the Bartholomew plan; the Graving Docks use the Bartholomew plan because the 1863–65 sheet shows no dock there). It cuts a 1000 × 750 px window around that point, draws a ring on the spot and saves `public/then/<stop-slug>.webp`.
4. It writes the result for each stop (source, pixel position, size) back to `scripts/then-config.json`.

The crops are committed, so a normal build does not need the scans or a network connection. Linthouse is outside both maps, so it has no then-picture; its stop says why.

Captions only give the map's title and date and say that the ring marks where the stop is today.

### Map sources and licences

- **Ordnance Survey six-inch map, Lanarkshire Sheet 6, 1863–65.** Public domain (copyright expired). Original via [British History Online](https://www.british-history.ac.uk/os-1-to-10560/lanarkshire/006); scan on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Map_of_Lanarkshire_Sheet_006,_Ordnance_Survey,_1863-1865.jpg). Used for almost every stop.
- **John Bartholomew, *New Plan of Glasgow with suburbs*, 1882.** Public domain (copyright expired). Original held by the [Bibliothèque nationale de France (Gallica)](https://gallica.bnf.fr/ark:/12148/btv1b53239419r); scan on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:New_Plan_of_Glasgow_with_suburbs_from_Ordnance_and_actual_surveys,_constructed_for_the_post_office_-_directory_by_John_Bartholomew..._-_btv1b53239419r.jpg).

Every then-picture on the site shows its credit and a link to the Commons file.

## Credits and sources

- **Stories:** every stop's name, date, tagline, story and quick facts come word for word from [The Govan Atlas](https://github.com/neemitjamwal/govan).
- **Today's map:** map data and tiles © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), under the Open Database License (ODbL). The attribution is always shown on the map. Stop positions were checked against OpenStreetMap.
- **Historic maps:** see [Map sources and licences](#map-sources-and-licences).
- **Software:** [Astro](https://astro.build/), [Leaflet](https://leafletjs.com/) (BSD-2-Clause), [Tailwind CSS](https://tailwindcss.com/), [Vitest](https://vitest.dev/) and [sharp](https://sharp.pixelplumbing.com/).

The site's own [credits page](src/pages/credits.astro) (`/credits/`) lists the same sources.

## Content rule

Stop names, dates, taglines, stories and quick facts are copied **verbatim** from The Govan Atlas (`src/data/landmarks.ts` in that repository). Do not invent, paraphrase, embellish or "improve" historical claims here. Walk themes and intros, and the home page intro, may only restate facts that are already in those stories. If an Atlas fact looks wrong, fix it in the Atlas first and copy the change across.

## Deploy to Netlify

The repository includes `netlify.toml`, so Netlify needs no extra settings:

- build command `npm run build`,
- publish directory `dist`,
- `NODE_VERSION = "22.22.0"`,
- long-lived cache headers for the fingerprinted files in `/_astro/*`, and a one-week cache for `/then/*`.

To deploy:

1. Push this repository to GitHub.
2. In Netlify, choose **Add new site → Import an existing project → GitHub** and pick the `govan-walks` repository.
3. Keep the settings read from `netlify.toml` and click **Deploy**.

Netlify then rebuilds and publishes the site on every push to `main`.
