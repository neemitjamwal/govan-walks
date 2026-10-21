import { routeLength, walkingMinutes } from '../lib/geo';
import { getStop, type Stop } from './stops';

export interface Walk {
  slug: string;
  name: string;
  theme: string;
  intro: string;
  stops: string[];
}

// Themes and intros may only restate facts already present in the stop stories.
export const walks: Walk[] = [
  {
    slug: 'ancient-govan',
    name: 'Ancient Govan',
    theme: 'From the ancient ford to the Govan Stones, round the oldest corner of Govan.',
    intro:
      "Start at Govan Cross, where the subway has run since 1896, and walk down Water Row — where Govan began, at an ancient ford over the Clyde — past the site of Doomster Hill, thought to have been the open-air parliament of the Kingdom of Strathclyde. Follow the crossing from ford to ferry to the Govan–Partick Bridge of 2024, then take the Old Govan Walkway along the river to Govan Old, a Christian site since roughly AD 500 and home to the Govan Stones.",
    stops: [
      'govan-cross',
      'doomster-hill',
      'water-row',
      'govan-ferry',
      'govan-partick-bridge',
      'old-govan-walkway',
      'govan-old-church',
    ],
  },
  {
    slug: 'the-yards',
    name: 'The Yards',
    theme: 'Dry docks, shipyard offices and the berths that built the world.',
    intro:
      "Begin at the Govan Graving Docks, carved into the riverbank by the Clyde Navigation Trust between 1869 and 1898, and walk west along Govan Road past 'the Black Man', the Pearce Institute, St Anthony's and the Lyceum. Then come to the Fairfield offices and the yard next door, where ships are still built on the very same site, then pass the Clyde Tunnel, whose pedestrian and cycle tunnels run under the River Clyde itself, before ending at Linthouse.",
    stops: [
      'govan-graving-docks',
      'pearce-statue',
      'pearce-institute',
      'st-anthonys-church',
      'lyceum-cinema',
      'fairfield-heritage',
      'shipyards',
      'clyde-tunnel',
      'linthouse',
    ],
  },
  {
    slug: 'isabella-elder',
    name: "Isabella Elder's Govan",
    theme: 'The park, the library and the hospital one woman gave to Govan.',
    intro:
      "Start at the offices of Fairfield, the shipyard of John Elder that made Govan world-famous, then follow Isabella Elder's gifts to Govan: the library Andrew Carnegie opened in 1903 on her condition that it open on Sundays, the park she gave in 1885, and the hospital whose wards she named after Sophia Jex-Blake and Florence Nightingale. On the way, a mural on a Langlands Road tenement sets her profile beside the library she paid for.",
    stops: ['fairfield-heritage', 'elder-park-library', 'isabella-elder-mural', 'elder-park', 'elder-cottage-hospital'],
  },
];

export function getWalk(slug: string): Walk | undefined {
  return walks.find((w) => w.slug === slug);
}

export function stopsForWalk(walk: Walk): Stop[] {
  return walk.stops.map((slug) => {
    const stop = getStop(slug);
    if (!stop) throw new Error(`Walk ${walk.slug} uses unknown stop ${slug}`);
    return stop;
  });
}

export interface WalkStats {
  distanceM: number;
  minutes: number;
  stopCount: number;
}

export function walkStats(walk: Walk): WalkStats {
  const distanceM = routeLength(stopsForWalk(walk));
  return { distanceM, minutes: walkingMinutes(distanceM), stopCount: walk.stops.length };
}
