// Stop text (name, era, tagline, story, quickFacts) is copied verbatim from The Govan Atlas
// (src/data/landmarks.ts in https://github.com/neemitjamwal/govan). Do not edit it here;
// tests/stops-atlas.test.ts checks it against the Atlas when that repo is available.
import type { LatLng } from '../lib/geo';

export type ThenSource = 'os6-lanark-1863' | 'bartholomew-1882';

export interface ThenPicture {
  src: string;
  source: ThenSource;
  caption: string;
  credit: string;
  creditUrl: string;
}

export interface Stop extends LatLng {
  slug: string;
  name: string;
  era: string;
  tagline: string;
  story: string[];
  quickFacts: { label: string; value: string }[];
  coordNote: string;
  then?: ThenPicture;
  thenUnavailable?: string;
}

const OS_SIX_INCH = {
  source: 'os6-lanark-1863',
  caption: 'Ordnance Survey six-inch map, Lanarkshire Sheet 6, published 1863–65. The ring marks where this stop is today.',
  credit: 'Public domain · scan via British History Online / Wikimedia Commons',
  creditUrl: 'https://commons.wikimedia.org/wiki/File:Map_of_Lanarkshire_Sheet_006,_Ordnance_Survey,_1863-1865.jpg',
} as const;

const BARTHOLOMEW_1882 = {
  source: 'bartholomew-1882',
  caption: 'John Bartholomew, New Plan of Glasgow with suburbs, 1882. The ring marks where this stop is today.',
  credit: 'Public domain · Bibliothèque nationale de France (Gallica) via Wikimedia Commons',
  creditUrl:
    'https://commons.wikimedia.org/wiki/File:New_Plan_of_Glasgow_with_suburbs_from_Ordnance_and_actual_surveys,_constructed_for_the_post_office_-_directory_by_John_Bartholomew..._-_btv1b53239419r.jpg',
} as const;

// Which scan each crop comes from is decided in scripts/then-config.json; tests/then-crops.test.ts keeps the two in step.
const thenFrom = (map: typeof OS_SIX_INCH | typeof BARTHOLOMEW_1882, slug: string): ThenPicture => ({ src: `/then/${slug}.webp`, ...map });

export const stops: Stop[] = [
  {
    slug: "govan-cross",
    name: "Govan Cross",
    era: "Subway since 1896 · statue since 2018",
    tagline: "Glasgow's third-oldest Underground station — and Mary Barbour's bronze army marching out to meet it",
    story: [
      "Govan Cross is the district's beating public square, and its subway station is a piece of transport history in its own right. It opened on 14 December 1896 — the same day as the rest of the Glasgow Subway, making it part of the third-oldest underground metro system in the world, after London's Metropolitan Railway (1863) and the Budapest Metro (1896). The station was originally named simply \"Govan Cross\" from 1896 until 1977, and was rebuilt as part of the Subway's 1970s modernisation, reopening on 16 April 1980.",
      "Step outside the station and you meet Mary Barbour in bronze. Unveiled on 8 March 2018 — International Women's Day — the sculpture by Andrew Brown shows Barbour leading a procession of women, children and workers, capturing the moment in November 1915 when she led a 20,000-strong march through Glasgow at the height of the Rent Strikes. Brown won the commission through a public vote; his own great-grandfather had once ministered at Govan and Linthouse Parish Church nearby.",
      "It is a fitting pairing: a station that has carried Govan's working people for well over a century, standing beside a monument to the woman who fought for their homes."
    ],
    quickFacts: [
      {
        label: "Subway opened",
        value: "14 December 1896 (3rd-oldest metro system worldwide)"
      },
      {
        label: "Original station name",
        value: "\"Govan Cross\", 1896–1977"
      },
      {
        label: "Statue",
        value: "Mary Barbour, by Andrew Brown"
      },
      {
        label: "Statue unveiled",
        value: "8 March 2018, International Women's Day"
      }
    ],
    lat: 55.86265,
    lng: -4.31115,
    coordNote: "OSM node 5574776483 (Mary Barbour Statue, 55.86261,-4.31107) and Govan subway entrances (OSM node 5862364618); Atlas point (55.8628,-4.3117) was ~45 m north-west on the Govan Road junction. Moved to the public square beside the statue with the station entrance in view.",
    then: thenFrom(OS_SIX_INCH, "govan-cross"),
  },
  {
    slug: "doomster-hill",
    name: "Doomster Hill",
    era: "Early medieval — levelled in the 1800s",
    tagline: "The parliament mound of a lost kingdom, flattened for industry",
    story: [
      "A short walk from Govan Old, beside Water Row, there once stood a great earthen mound — stepped, flat-topped, and big enough to hold a crowd. It was called Doomster Hill, and the name gives the game away: this was a place where judgment was given. Mounds like it are known across the Norse world as assembly places, and Govan's is thought to have been the open-air parliament of the Kingdom of Strathclyde, standing directly across the river from the royal residence at Partick.",
      "Its origins are genuinely open. Archaeologists have suggested it may have begun as a prehistoric barrow that the kings of Strathclyde reshaped for their own purposes; when Channel 4's Time Team excavated the site in 1996, they raised the alternative that it was a 12th-century Norman motte. What is certain is how it ended. The mound was levelled in the mid-19th century as industry took the riverbank, and nothing of it survives above ground.",
      "The ground has not given up its secrets, though. Since 2023 the 'Dig Where You Stand' project — volunteers working alongside professionals from Clyde Archaeology and the University of Glasgow, supported by the Society of Antiquaries of Scotland — has been excavating around Govan Old, still looking for what the Victorians swept away. It has already found fragments of a roadway roughly 1,300 years old, running from the churchyard towards where the hill stood: the route people walked to the assembly."
    ],
    quickFacts: [
      {
        label: "What it was",
        value: "Probable assembly mound of the Kingdom of Strathclyde"
      },
      {
        label: "Lost",
        value: "Levelled in the mid-19th century"
      },
      {
        label: "Excavated",
        value: "Time Team, 1996"
      },
      {
        label: "Recent work",
        value: "'Dig Where You Stand', 2023 onwards"
      },
      {
        label: "Found so far",
        value: "A roadway c. 1,300 years old toward the mound"
      }
    ],
    lat: 55.86372,
    lng: -4.31078,
    coordNote: "Site built over; no OSM feature. Canmore position 55.86365,-4.31051 (+/-100 m) is on private ground of the new Water Row housing. Walk point is the nearest point on the public street Water Row (OSM way 48464395), ~22 m west of the Canmore position. (Paved footways in the housing, OSM way 1535204332, pass ~10 m away but were not used.)",
    then: thenFrom(OS_SIX_INCH, "doomster-hill"),
  },
  {
    slug: "water-row",
    name: "Water Row",
    era: "Medieval → 2022",
    tagline: "The thousand-year crossing — from ancient ford to Govan's newest neighbourhood",
    story: [
      "Water Row is where Govan began. In the early medieval period, an ancient ford crossed the Clyde here, connecting Govan to the royal residence at Partick on the north bank. Close by stood Doomster Hill — a great stepped mound believed to have been the open-air assembly place of the Kingdom of Strathclyde, levelled without ceremony in the industrial age. For centuries this short lane to the river was the district's front door — later the landing of the Govan ferry, and in the industrial age, flanked by the workshops Harland & Wolff built along its west side in 1914–15.",
      "After decades of dereliction following the yards' closure, Water Row is alive again. The first phase of the Water Row masterplan, begun in 2022, delivered 92 new homes for mid-market rent with six ground-floor commercial and community units — putting people back on the site of the ancient crossing.",
      "And in 2024 history rhymed: the new Govan–Partick Bridge opened beside Water Row, reconnecting the same two banks the ford joined a thousand years ago."
    ],
    quickFacts: [
      {
        label: "Original role",
        value: "Medieval ford to Partick"
      },
      {
        label: "Phase 1 completed",
        value: "2022"
      },
      {
        label: "New homes",
        value: "92 (mid-market rent)"
      },
      {
        label: "Commercial units",
        value: "6 ground-floor spaces"
      }
    ],
    lat: 55.86398,
    lng: -4.31045,
    coordNote: "OSM way 48464395 (Water Row). Atlas point (55.8646,-4.3105) was ~70 m north, past the end of the street. Moved onto Water Row near its river end, beside the gate to the riverside path (OSM node 8027022913).",
    then: thenFrom(OS_SIX_INCH, "water-row"),
  },
  {
    slug: "govan-ferry",
    name: "The Govan Ferry",
    era: "1734–1966 · returned 2011",
    tagline: "The crossing that ran for two centuries, died in 1966, and came back as a summer pontoon",
    story: [
      "The ford at Water Row gave way, eventually, to a boat. The first record of a ferry from Pointhouse to Govan dates from 1734, and in 1857 the Clyde Navigation Trust took the service over, running it as one link in the chain of crossings that stitched the two banks of an industrial river together.",
      "Govan's was a double-ended vessel with a small cab for the captain at each end and shelters on either side for passengers; elevating-deck ferries of the kind used at the Clyde's vehicular crossings were later introduced here and at Whiteinch. For generations of yard workers it was simply how you got to your work. It did not survive the road tunnel: the passenger ferry was withdrawn from the Govan–Pointhouse crossing in 1966, two years after the second bore of the Clyde Tunnel opened.",
      "In June 2011 a ferry came back, running seasonally between a new pontoon at Water Row and the Kelvin Harbour landing stage beside the Riverside Museum. Since 2024 the Govan–Partick Bridge has made the crossing permanent again — 290 years after the first record of the boat."
    ],
    quickFacts: [
      {
        label: "First recorded",
        value: "1734"
      },
      {
        label: "Operator",
        value: "Clyde Navigation Trust, from 1857"
      },
      {
        label: "Withdrawn",
        value: "1966"
      },
      {
        label: "Returned",
        value: "Seasonal ferry, June 2011; bridge, 2024"
      }
    ],
    lat: 55.86438,
    lng: -4.31003,
    coordNote: "Ferry pontoon is not mapped in OSM; Atlas point (55.8652,-4.3098) was in the river. Moved to the riverside path at the foot of the Water Row steps (OSM way 1313952448 steps, way 1313952449 path start), the public riverbank at the Water Row end.",
    then: thenFrom(OS_SIX_INCH, "govan-ferry"),
  },
  {
    slug: "govan-partick-bridge",
    name: "Govan–Partick Bridge",
    era: "Opened 2024",
    tagline: "The crossing reborn — a thousand years after the ford",
    story: [
      "For most of Govan's history, the river was crossed here — first by the ancient ford at Water Row, then by the Govan ferry that carried generations of shipyard workers. When the ferries stopped, the two banks that had faced each other for a millennium were left a long detour apart.",
      "The Govan–Partick Bridge, opened in 2024, put that right. The pedestrian and cycle bridge springs from Water Row to Pointhouse on the north bank, landing beside the Riverside Museum — a five-minute walk now connects one of Scotland's most visited attractions with the Govan Stones and the historic heart of the district.",
      "Planners see it as the spine of an emerging cultural quarter spanning both banks. Govan sees something simpler and older: the crossing is back."
    ],
    quickFacts: [
      {
        label: "Opened",
        value: "2024"
      },
      {
        label: "Type",
        value: "Pedestrian & cycle opening bridge"
      },
      {
        label: "Connects",
        value: "Water Row ↔ Pointhouse (Riverside Museum)"
      },
      {
        label: "Crossing time",
        value: "About 5 minutes on foot"
      }
    ],
    lat: 55.864526,
    lng: -4.309356,
    coordNote: "OSM way 1231763104 (Govan-Partick Bridge, swing span, foot=designated), mid-span point; bridge outline OSM way 1512773029. Atlas point (55.8655,-4.3090) was ~110 m north, beyond the bridge in the river.",
    then: thenFrom(OS_SIX_INCH, "govan-partick-bridge"),
  },
  {
    slug: "old-govan-walkway",
    name: "The Old Govan Walkway",
    era: "Opened 2017",
    tagline: "The riverbank Govan got back — shut since the shipyard gates closed, reopened as a walk along the Clyde",
    story: [
      "For decades after Harland & Wolff closed, the stretch of riverbank beside Govan Old was simply unreachable — fenced-off industrial ground between the church and the water. The Old Govan Walkway changed that. It opened in May 2017, running along the Clyde from Water Row to Wanlock Street, and restored public access to this part of the riverside for the first time since the yard shut.",
      "It was never just a path. The roughly £800,000 project meant stabilising the embankment, taking down and rebuilding the river revetment wall stone by stone, a gabion retaining wall, new lighting and CCTV, and viewing platforms out over the water. It also wrapped a new path right around Govan Old, so that a church which had faced the river for eleven hundred years could finally be seen from it again.",
      "Walk it now and the whole argument for Govan lays itself out in five minutes: the Clyde on one side, the medieval churchyard on the other, Glasgow Harbour on the far bank, and at the Water Row end the ferry pontoon and the Govan–Partick Bridge."
    ],
    quickFacts: [
      {
        label: "Opened",
        value: "May 2017"
      },
      {
        label: "Route",
        value: "Water Row → Wanlock Street, along the Clyde"
      },
      {
        label: "Project value",
        value: "About £800,000"
      },
      {
        label: "Why it matters",
        value: "First public riverside access since Harland & Wolff closed"
      }
    ],
    lat: 55.86525,
    lng: -4.312659,
    coordNote: "Riverside path north of Govan Old: junction of OSM ways 1313952449 and 898486541 (paths from Water Row towards Wanlock Street, way 1314380445). Atlas point (55.865,-4.3125) was ~30 m south on the churchyard edge; moved onto the path.",
    then: thenFrom(OS_SIX_INCH, "old-govan-walkway"),
  },
  {
    slug: "govan-old-church",
    name: "Govan Old & the Govan Stones",
    era: "c. 870 · rebuilt 1884–1888",
    tagline: "The ancient heart of Govan — and one of Britain's finest collections of early medieval sculpture",
    story: [
      "Long before the shipyards, this bend of the Clyde was holy ground — a Christian site since roughly AD 500, dedicated to Constantine of Strathclyde. Around the 9th and 10th centuries, a school of master carvers working here produced the Govan Stones — an extraordinary collection of carved monuments including massive hogback grave markers, cross-slabs and the celebrated Govan Sarcophagus, a single hollowed block of stone with no parallel in Scotland, dug out of the churchyard in 1855. Their quality and quantity point to Govan being a royal and religious centre of the lost Kingdom of Strathclyde.",
      "Five of the monuments are hogbacks — long, house-shaped blocks carved so that a grave resembles a building, a Norse form found only where Scandinavian settlers took hold in northern Britain. It is the largest known group of hogbacks anywhere in Scotland.",
      "The present church was designed by Robert Rowand Anderson, one of Scotland's great Victorian architects, and built between 1884 and 1888 at the height of Govan's shipbuilding wealth. It ceased to be an active parish church in 2007, and in 2016 the community-led Govan Heritage Trust took ownership, securing the building's future.",
      "Today 31 carved stones are displayed inside the church, and a major redevelopment is planned to transform Govan Old into a museum and visitor attraction worthy of a collection of international importance.",
      "The collection very nearly lost a large part of itself. Until 1973, fifteen stones stood against the churchyard wall; when the neighbouring Harland & Wolff plating shed was demolished, fourteen recumbent gravestones disappeared in the clearance, apparently mistaken for rubble. They were presumed destroyed for nearly half a century — until 2019, when a 14-year-old volunteer on the Stones ’n’ Bones community programme dug one up. Three have now been recovered.",
      "The churchyard is still an active excavation. In September 2023 a University of Glasgow team led by Professor Stephen Driscoll lifted the 9th-century “Govan Warrior” — a figure with a pointed beard, a ponytail and a round shield, cut in fine, shallow lines unlike the heavy Govan School style — which Driscoll called probably the most important find of his thirty years on the site. In September 2026 the Dig Where You Stand project found an unfinished shale finger ring and a block of raw shale: evidence that jewellery was being made here, not merely bought in."
    ],
    quickFacts: [
      {
        label: "Stones on display",
        value: "31 early medieval carved monuments"
      },
      {
        label: "Hogbacks",
        value: "5 — Scotland's largest group"
      },
      {
        label: "Architect",
        value: "Robert Rowand Anderson"
      },
      {
        label: "Built",
        value: "1884–1888"
      },
      {
        label: "Owned by",
        value: "Govan Heritage Trust (since 2016)"
      },
      {
        label: "Latest find",
        value: "Shale jewellery workshop, September 2026"
      }
    ],
    lat: 55.864372,
    lng: -4.312854,
    coordNote: "OSM way 49859412 (Govan Old Parish Church, centroid 55.86460,-4.31300) and node 12920194973 (The Govan Stones). Atlas point (55.8641,-4.3128) was ~30 m south. Walk point is on the path round the church (OSM way 898486544) at its south-east corner.",
    then: thenFrom(OS_SIX_INCH, "govan-old-church"),
  },
  {
    slug: "govan-graving-docks",
    name: "Govan Graving Docks",
    era: "Built 1869–1898",
    tagline: "\"Without parallel in Scotland\" — the abandoned cathedral of ship repair, waiting for its second life",
    story: [
      "Between 1869 and 1898 the Clyde Navigation Trust carved three vast dry docks into the Govan riverbank, faced in hand-carved grey granite. Docks No. 1 and 3 were the deepest in Britain when built — here the ships the Clyde launched came home to be repaired, cleaned and refitted, generation after generation.",
      "The docks worked until 1987, then fell silent. Nearly four decades of dereliction followed — yet the complex survived almost intact, earning category A listing and Historic Scotland's verdict: \"an outstanding graving dock complex without parallel in Scotland.\" Urban explorers and film crews found it first; most of Glasgow still doesn't know it's there.",
      "Now the tide is turning. Backed by community campaigning and a £2.4 million Scottish Government grant, plans are advancing for a Maritime Heritage Park — Dry Dock 1 restored for historic ship repair, wetlands around the basins, and the A-listed pump house brought back to life. The cathedral of ship repair may yet hold ships again."
    ],
    quickFacts: [
      {
        label: "Built",
        value: "1869–1898, Clyde Navigation Trust"
      },
      {
        label: "Claim to fame",
        value: "Deepest dry docks in Britain when built"
      },
      {
        label: "Status",
        value: "Category A listed; closed 1987"
      },
      {
        label: "Future",
        value: "Maritime Heritage Park (restoration funded)"
      }
    ],
    lat: 55.85995,
    lng: -4.30225,
    coordNote: "OSM ways 27012765, 27012748, 27011787 (Govan Graving Docks 1-3, fenced, no public access). Atlas point (55.8633,-4.3000) was ~370 m north on the Clydeside Expressway/river. Moved to the Govan Road pavement (OSM way 255159951, sidewalk=both) beside the head of Dock 3, near Stag Street.",
    then: thenFrom(BARTHOLOMEW_1882, "govan-graving-docks"),
  },
  {
    slug: "pearce-statue",
    name: "The Black Man — Sir William Pearce Monument",
    era: "Unveiled 1894",
    tagline: "Govan's best-known landmark, and hardly anyone calls it by its real name",
    story: [
      "Stand at Govan Cross and you cannot miss him: an over-lifesize bronze figure on a tall Peterhead granite plinth, a ship's plan rolled in his hand. This is Sir William Pearce, who took over John Elder's Fairfield yard, drove it into the front rank of world shipbuilding, and became Govan's first Member of Parliament.",
      "The monument was sculpted by Edward Onslow Ford and paid for by public subscription, unveiled on 6 October 1894 on the southern side of Govan Road — facing the Pearce Institute that his widow would later give to the town. Then Glasgow's soot did the rest. Within a few years the bronze had blackened, and Govan quietly renamed the thing: to generations of locals it is simply 'the Black Man', a meeting place, a landmark and a set of directions all at once.",
      "After 119 years of Clydeside weather, the Govan Cross Townscape Heritage Initiative had the monument repaired in 2013, with funding from the Heritage Lottery Fund and Glasgow City Council."
    ],
    quickFacts: [
      {
        label: "Unveiled",
        value: "6 October 1894"
      },
      {
        label: "Sculptor",
        value: "Edward Onslow Ford"
      },
      {
        label: "Materials",
        value: "Bronze on a Peterhead granite plinth"
      },
      {
        label: "Known locally as",
        value: "'The Black Man'"
      }
    ],
    lat: 55.863313,
    lng: -4.312881,
    coordNote: "OSM node 1558524726 (Sir William Pearce memorial), on the south side of Govan Road. Atlas point (55.8634,-4.3122) was ~45 m east; OSM position used as is (public pavement at Govan Cross).",
    then: thenFrom(OS_SIX_INCH, "pearce-statue"),
  },
  {
    slug: "pearce-institute",
    name: "The Pearce Institute",
    era: "Built 1902–1906",
    tagline: "Lady Pearce's gift — Govan's grandest front room, still doing its job after 120 years",
    story: [
      "When Sir William Pearce died in 1888, his widow Dinah, Lady Pearce, spent part of his shipbuilding fortune on something Govan could use every day of the week. She commissioned Sir Robert Rowand Anderson — the architect who had rebuilt Govan Old a few years earlier — to design a hall and institute for the people of the burgh. It was built between 1902 and 1906 and handed over to the community together with a charitable trust to run it.",
      "Anderson modelled it on a great 17th-century Scottish town house: crow-stepped gables, sandstone blocks laid in deliberately irregular courses, a thicket of carving, and an octagonal tower topped by a balconied cupola whose ironwork carries emblems of the nations of the United Kingdom. Inside were the things a shipyard town actually needed — a gymnasium, reading rooms, workshops, meeting halls.",
      "The Pearce Institute is Category A listed, recognised as a building of national importance. More to the point, it has never stopped doing what it was built for: community groups, charities, classes and events still fill it, right at Govan Cross."
    ],
    quickFacts: [
      {
        label: "Built",
        value: "1902–1906"
      },
      {
        label: "Architect",
        value: "Sir Robert Rowand Anderson"
      },
      {
        label: "Given by",
        value: "Dinah, Lady Pearce"
      },
      {
        label: "Status",
        value: "Category A listed; still in community use"
      }
    ],
    lat: 55.8634,
    lng: -4.3124,
    coordNote: "OSM way 48464206 (The Pearce Institute, centroid 55.86363,-4.31261) with entrance node 9176498624 on Govan Road. Atlas point (55.8636,-4.3128) fell inside the building; moved ~35 m to the Govan Road pavement at the entrance (kept just over 30 m from the Pearce statue).",
    then: thenFrom(OS_SIX_INCH, "pearce-institute"),
  },
  {
    slug: "st-anthonys-church",
    name: "St Anthony’s Church",
    era: "Opened 1879",
    tagline: "The Italianate tower on Govan Road — built for the shipyards’ Irish Catholic workforce",
    story: [
      "St Anthony’s stands at 831 Govan Road, on the corner of the wonderfully named Harmony Row. It was designed by John Honeyman between 1877 and 1879 and opened on 26 October 1879, built to serve the large Irish Catholic population drawn to Govan by the yards — a congregation that had outgrown every space it had tried before.",
      "Honeyman reached for Italy rather than Gothic: coursed rubble banded with red ashlar, a pedimented front to Govan Road, and at the corner a square tower with paired round-headed openings under a pyramidal copper roof. The result is unlike anything else on the street, and it reads as Italian Romanesque with a Byzantine accent.",
      "Honeyman’s practice would go on, as Honeyman & Keppie, to employ a young draughtsman named Charles Rennie Mackintosh — so Govan’s Catholic parish church sits one step up the family tree from the Glasgow Style. The building is Category B listed."
    ],
    quickFacts: [
      {
        label: "Architect",
        value: "John Honeyman"
      },
      {
        label: "Designed",
        value: "1877–1879"
      },
      {
        label: "Opened",
        value: "26 October 1879"
      },
      {
        label: "Listing",
        value: "Category B"
      }
    ],
    lat: 55.86368,
    lng: -4.31445,
    coordNote: "OSM way 49860134 (St Anthony's RC Church, 2 Harmony Row, centroid 55.86350,-4.31446). Atlas point (55.8635,-4.3144) was inside the building; moved ~20 m north to the Govan Road pavement in front of the church.",
    then: thenFrom(OS_SIX_INCH, "st-anthonys-church"),
  },
  {
    slug: "lyceum-cinema",
    name: "The Lyceum",
    era: "Opened 1938",
    tagline: "2,600 seats, a hand-painted Disney frieze in the foyer, and forty years of silence",
    story: [
      "The Lyceum opened on 19 December 1938 with Gracie Fields and Victor McLaglen in We're Going To Be Rich. It stood on the site of the 1898 Lyceum Music Hall, which had been converted to a cinema in 1923 and burned down in 1937. Charles J. McNair and the cinema specialist Henry F. Elder designed the replacement for 2,600 people — International Modern on the outside, Streamline Moderne within.",
      "It was the picture house of a district that could fill it several times a week. Partly converted for bingo in the 1970s, it stopped showing films in 1981, and the building has stood empty for decades since. Remarkably, a great deal survived the wait: original seating, Art Deco fittings, projection-room equipment, and a hand-painted frieze of Disney characters in the foyer.",
      "The B-listed Lyceum now sits on the Buildings at Risk Register — one of the most significant surviving inter-war cinemas in Scotland, and one of the biggest prizes left in Govan's regeneration. Campaigns to bring it back have come and gone. The building is still standing, still waiting."
    ],
    quickFacts: [
      {
        label: "Opened",
        value: "19 December 1938"
      },
      {
        label: "Capacity",
        value: "2,600 seats"
      },
      {
        label: "Architects",
        value: "Charles J. McNair & Henry F. Elder"
      },
      {
        label: "Status",
        value: "Category B listed; on the Buildings at Risk Register"
      }
    ],
    lat: 55.8638,
    lng: -4.3152,
    coordNote: "Subject: Historic Environment Scotland place 172378 (Lyceum, 908 Govan Road, NGR 255212 665882, 55.86430,-4.31516). No OSM feature is named Lyceum. Atlas point kept: it lies on the Govan Road pavement (OSM way 656254486, ~5 m from the centreline), ~70 m west of St Anthony's and ~56 m along the same pavement from the HES point, with the building in view.",
    then: thenFrom(OS_SIX_INCH, "lyceum-cinema"),
  },
  {
    slug: "fairfield-heritage",
    name: "Fairfield Offices & Fairfield Heritage",
    era: "Built 1888–1891",
    tagline: "The red sandstone palace a shipyard built for itself — rescued, restored, and open to anyone",
    story: [
      "Fairfield's owners did not put up a shed for their headquarters. Between 1888 and 1891 they built an Italian Renaissance palace on Govan Road, designed by John Keppie of Honeyman & Keppie — a practice whose junior assistant at the time was a young Charles Rennie Mackintosh. Flanking the entrance, James Pittendreigh Macgillivray carved the two figures the building existed to direct: a shipwright and an engineer.",
      "Behind that façade were the drawing offices where Clyde-built ships were designed for more than a century. Successive owners of the yard used it until 2001, when BAE Systems Marine moved out. Eight years of empty deterioration followed, and the Category A listed building looked set to go the way of most of Govan's industrial architecture.",
      "It was saved by a local social enterprise. Govan Workspace bought it in 2009 and spent over £5.8 million on a restoration by Page\\Park Architects, reopening in 2013. The ground floor is now Fairfield Heritage — a free museum of more than 150 years of Clyde shipbuilding — and the rest is working office space. The yard next door is still building ships."
    ],
    quickFacts: [
      {
        label: "Built",
        value: "1888–1891"
      },
      {
        label: "Architect",
        value: "John Keppie, Honeyman & Keppie"
      },
      {
        label: "Status",
        value: "Category A listed (1970)"
      },
      {
        label: "Reborn",
        value: "£5.8m restoration; reopened 2013"
      }
    ],
    lat: 55.8641,
    lng: -4.3201,
    coordNote: "OSM node 3791239455 (Fairfield Heritage Centre, 1048 Govan Road, 55.86410,-4.32010). Atlas point matches within 1 m; kept. It is at the building frontage on the Govan Road pavement.",
    then: thenFrom(OS_SIX_INCH, "fairfield-heritage"),
  },
  {
    slug: "shipyards",
    name: "The Govan Shipyards",
    era: "1864–1963 · shipbuilding continues",
    tagline: "Fairfield and Harland & Wolff — the berths that built the world",
    story: [
      "In 1864 John Elder moved his firm to a new yard on the former Fairfield Farm at the Govan riverside, laid out over the years that followed and complete by 1871 with six building berths and a fitting-out basin. Elder had pioneered the compound steam engine — a revolution in fuel efficiency that transformed ocean travel — and Fairfield became one of the Clyde's largest and most innovative yards, building liners and warships for the world.",
      "In 1912 Belfast's Harland & Wolff acquired and amalgamated the Govan Old, Middleton and Govan New yards, adding a fitting-out basin and, in 1914–15, an extensive range of workshops along Water Row. The combined yards specialised in tankers and cargo ships. At the industry's peak in the early 1900s, the Clyde launched roughly a fifth of the world's ships — and Govan was its beating heart.",
      "What came off those berths is not widely remembered. Fairfield launched RMS Campania in September 1892 and her sister RMS Lucania soon after; Campania took the eastbound Blue Riband in 1893, crossing the Atlantic in under six days, and Lucania took the record off her in 1894 — the fastest liners on the Atlantic, twice over, from the same Govan yard. Fairfield also launched RMS Empress of Ireland in January 1906, which sank in the St Lawrence in fourteen minutes in May 1914 with the loss of 840 passengers, more than died on the Titanic. In the First World War the yard turned out around 50 warships, and in 1950 it completed HMS Delight, the Royal Navy's first all-welded warship.",
      "Over it all stood the Fairfield Titan, a cantilever crane built for the yard in 1911 by Sir William Arrol & Co and for many years acknowledged as the largest crane in the world. Category A listed and still working — it was last used six weeks before the end, assembling a Type 45 destroyer — it was dismantled in 2007 and recycled.",
      "The Harland & Wolff yard fell silent in 1963. But the Fairfield yard never stopped: through Upper Clyde Shipbuilders, Govan Shipbuilders and Kvaerner, it survived every crisis, and today ships are still built on the very same site by BAE Systems, in a hall named for Janet Harvey, who joined the Clyde yards as an 18-year-old electrician in 1940. The magnificent red sandstone Fairfield drawing offices now house Fairfield Heritage, telling the yards' story."
    ],
    quickFacts: [
      {
        label: "Fairfield opened",
        value: "1864 (John Elder)"
      },
      {
        label: "H&W era",
        value: "1912–1963"
      },
      {
        label: "World share",
        value: "~1/5 of ships launched, early 1900s"
      },
      {
        label: "Blue Riband",
        value: "Campania 1893, Lucania 1894"
      },
      {
        label: "Largest crane",
        value: "Fairfield Titan, 1911–2007"
      },
      {
        label: "Today",
        value: "BAE Systems still builds ships at Govan"
      }
    ],
    lat: 55.86408,
    lng: -4.3233,
    coordNote: "BAE Systems yard (OSM way 133174308, landuse=industrial) is private. Atlas point (55.8654,-4.3197) was inside the yard. Moved to the north pavement of Govan Road (OSM way 11480917) against the yard boundary, opposite Elder Park, ~200 m west of the Fairfield offices.",
    then: thenFrom(OS_SIX_INCH, "shipyards"),
  },
  {
    slug: "linthouse",
    name: "Linthouse",
    era: "Yard from c. 1870 · engine shop 1872",
    tagline: "A cathedral of engineering stood here — then it was taken apart and rebuilt thirty miles away",
    story: [
      "Linthouse is Govan's western end, named for the estate Alexander Stephen & Sons bought when they needed more room than Kelvinhaugh could give them. Around 1870 the family moved their shipbuilding here, and in 1872 they built something extraordinary: an engine shop designed by John Frederick Spencer, an engineer who had worked with Isambard Kingdom Brunel, so the firm could build its own engines instead of buying them from outside contractors. Vast and glass-roofed, it was known as a cathedral of engineering.",
      "The yard closed, and by the late 1980s the plan was to demolish the engine shop to clear the site for industrial redevelopment. Instead came one of the most ambitious salvage operations in Scottish heritage: the entire Category A listed structure was dismantled piece by piece, moved to Irvine, and reassembled.",
      "It stands there today as the centrepiece of the Scottish Maritime Museum, which calls the building simply 'the Linthouse'. Govan's loss is real — the district's greatest industrial building is now an hour down the coast — but the alternative on the table was rubble."
    ],
    quickFacts: [
      {
        label: "Yard",
        value: "Alexander Stephen & Sons, from c. 1870"
      },
      {
        label: "Engine shop",
        value: "Built 1872, by John Frederick Spencer"
      },
      {
        label: "Status",
        value: "Category A listed"
      },
      {
        label: "Where it is now",
        value: "Scottish Maritime Museum, Irvine"
      }
    ],
    lat: 55.8672,
    lng: -4.3324,
    coordNote: "No OSM feature for the former Stephen yard. Atlas point kept: it lies on Holmfauld Road (OSM way 383064400, public road) in the riverside industrial ground of Linthouse, the nearest public point to the former yard.",
    thenUnavailable: "Linthouse lies just west of the edge of the Ordnance Survey six-inch Lanarkshire Sheet 6 (1863–65) and outside the frame of the 1882 Bartholomew plan, so neither public-domain map used here covers this spot.",
  },
  {
    slug: "clyde-tunnel",
    name: "The Clyde Tunnel",
    era: "Built 1957–1964",
    tagline: "Walk or cycle under the river — Govan's hidden crossing",
    story: [
      "Construction of the Clyde Tunnel began in 1957, and the first of its twin bores opened on 3 July 1963, with the second following in March 1964. The project cost £10.5 million — the equivalent of roughly £180 million today. The bores carry around 65,000 vehicles a day between Govan and Whiteinch — as many as the Forth Road Bridge — and when it opened it was reputedly the steepest road tunnel in the world, its 1-in-16 gradients needed to surface among the existing streets on either bank.",
      "But the tunnel's best secret sits beneath the traffic: under each road deck runs a separate pedestrian and cycle tunnel. Ten minutes on foot, a couple by bike — under the River Clyde itself, in a strange, echoing, strip-lit tube that most Glaswegians don't even know exists.",
      "It is one of the city's oddest and best free experiences, and a genuinely useful active-travel link — the third of Govan's three great river crossings, alongside the ford's successor bridge and the vanished ferries."
    ],
    quickFacts: [
      {
        label: "Opened",
        value: "First bore July 1963"
      },
      {
        label: "Length",
        value: "~762 m (2,500 ft)"
      },
      {
        label: "Gradient",
        value: "1:16 — world's steepest at opening"
      },
      {
        label: "The secret",
        value: "Separate walk & cycle tunnels beneath the road"
      }
    ],
    lat: 55.8646,
    lng: -4.3299,
    coordNote: "South portal of the pedestrian and cycle tunnel (OSM way 22752445 Clyde Tunnel cycleway, south end 55.86463,-4.32994; continues as way 22752446 to Govan Road). Atlas point (55.8668,-4.3370) was ~480 m away in the Linthouse industrial estate.",
    then: thenFrom(OS_SIX_INCH, "clyde-tunnel"),
  },
  {
    slug: "elder-park-library",
    name: "Elder Park Library",
    era: "Opened 1903 · refurbished 2024",
    tagline: "Opened by Andrew Carnegie — on Isabella Elder's condition that it open on Sundays",
    story: [
      "Isabella Elder gave Govan its park in 1885; eighteen years later she gave it the library standing in it. She put up £10,000 for the building and its first books, and a further £17,000 to endow its upkeep — around £27,000 in all — and hired Sir John James Burnet, then at the height of his powers, to design it.",
      "It opened in September 1903, and the man who performed the ceremony was Andrew Carnegie, the Dunfermline weaver's son whose fortune was building libraries across the English-speaking world. Isabella attached one condition to her money that says a great deal about her: the library had to open on Sundays — the one day Govan's shipyard workers were free to use it.",
      "The building is Category A listed. In 2024 it reopened after a £4 million refurbishment inside and out, with improved library space, new bookable community rooms and a community kitchen. It is still a working library, 120 years on, doing exactly what she paid for."
    ],
    quickFacts: [
      {
        label: "Opened",
        value: "September 1903, by Andrew Carnegie"
      },
      {
        label: "Architect",
        value: "Sir John James Burnet"
      },
      {
        label: "Funded by",
        value: "Isabella Elder — £10,000 plus a £17,000 endowment"
      },
      {
        label: "Reopened",
        value: "2024, after a £4m refurbishment"
      }
    ],
    lat: 55.86178,
    lng: -4.3219,
    coordNote: "OSM way 134836868 (Elder Park Library, centroid 55.86196,-4.32189). Atlas point (55.8620,-4.3219) was inside the building; moved ~20 m south to the Langlands Road frontage (OSM way 10682501).",
    then: thenFrom(OS_SIX_INCH, "elder-park-library"),
  },
  {
    slug: "isabella-elder-mural",
    name: "The Isabella Elder Mural",
    era: "Painted 2026",
    tagline: "The First Lady of Govan, the full height of a tenement gable on Langlands Road",
    story: [
      "Govan has spent years turning its blank gables and underpasses into a gallery — the Govan Mural Trail now runs right across the district. The newest addition is also the most local in subject: a portrait of Isabella Elder on the side of a pre-1919 sandstone tenement on Langlands Road.",
      "It was commissioned by Elderpark Housing to mark the association's 50th anniversary, and painted by Bobby McNamara — the Glasgow artist who works as Rogue One, and whose portraits of Charles Rennie Mackintosh and Billy Connolly are landmarks elsewhere in the city. The design sets Elder's profile beside the Elder Park Library she paid for, wrapped in the red roses of the park's rose garden.",
      "\"Isabella Elder left a lasting legacy to the people of Govan which is still relevant today,\" said Elderpark Housing chief executive Gary Dalziel when the commission was announced. \"It is entirely fitting in our 50th anniversary year that we recognise the impressive contribution of an exceptional woman to the wellbeing of our community over a century ago.\""
    ],
    quickFacts: [
      {
        label: "Artist",
        value: "Bobby McNamara (Rogue One)"
      },
      {
        label: "Commissioned by",
        value: "Elderpark Housing, for its 50th anniversary"
      },
      {
        label: "Location",
        value: "Tenement gable, Langlands Road"
      },
      {
        label: "Depicts",
        value: "Isabella Elder, Elder Park Library and the park roses"
      }
    ],
    lat: 55.861163,
    lng: -4.324276,
    coordNote: "Subject: street-art map pin for the mural at 243 Langlands Road (streetartcities.com, 55.8611333,-4.3241472), on the gable of tenement block OSM way 133368862; the mural is not mapped in OSM. Atlas point (55.8617,-4.3233) was ~82 m from the painted gable; moved ~83 m south-west along the Langlands Road pavement (OSM way 10682501) to stand in front of the gable, ~7 m from the road centreline and ~9 m from the pin.",
    then: thenFrom(OS_SIX_INCH, "isabella-elder-mural"),
  },
  {
    slug: "elder-park",
    name: "Elder Park",
    era: "Opened 1885",
    tagline: "Isabella Elder's gift to Govan — green space, learning and remembrance",
    story: [
      "Elder Park was gifted to the people of Govan in 1885 by Isabella Elder — philanthropist and champion of women's education — in memory of her husband John Elder, the engineering genius whose Fairfield shipyard made Govan world-famous. Statues of both stand in the park: John's by Archibald Shannan (1888), Isabella's by Sir J. E. Boehm (1906) — she is one of very few Scotswomen of her era honoured with a public statue.",
      "Elder Park Library, which Isabella also funded, was designed by John James Burnet at a cost of £27,000 and opened in September 1903 — by Andrew Carnegie himself. It is a working library to this day.",
      "The park also carries Govan's griefs. The K13 memorial, paid for by Fairfield's own workers, remembers the 32 men — 26 naval crew and 6 Fairfield employees — lost when submarine K13 sank in the Gareloch during trials on 29 January 1917; submariners still gather here each January. A second memorial commemorates the SS Daphne disaster of 1883, when a ship capsized at launch on the Clyde with the loss of well over a hundred workers.",
      "On summer days the park is Govan's garden, gym and gathering place all at once — the living centre of the community Isabella Elder hoped it would become."
    ],
    quickFacts: [
      {
        label: "Gifted by",
        value: "Isabella Elder, 1885"
      },
      {
        label: "Library",
        value: "By J. J. Burnet; opened 1903 by Andrew Carnegie"
      },
      {
        label: "Statues",
        value: "John Elder (1888) & Isabella Elder (1906)"
      },
      {
        label: "Memorials",
        value: "K13 submarine (1917) & SS Daphne (1883)"
      }
    ],
    lat: 55.861455,
    lng: -4.325502,
    coordNote: "OSM way 10682502 (Elder Park, leisure=park, access=yes) and node 12994517732 (Isabella Elder Statue, Canmore 164117). Atlas point (55.8607,-4.3266) was south of Langlands Road outside the park; moved into the park beside the Isabella Elder statue.",
    then: thenFrom(OS_SIX_INCH, "elder-park"),
  },
  {
    slug: "elder-cottage-hospital",
    name: "Elder Cottage Hospital",
    era: "Opened 1903",
    tagline: "The hospital Isabella Elder built — and the two women she named its wards after",
    story: [
      "Isabella Elder's third great gift to Govan, after the park and the library, was a hospital. She commissioned Sir John James Burnet — her library architect — to design it in 1901–02 on Drumoyne Drive, in memory of her husband John Elder.",
      "Her original intention was a cottage maternity hospital staffed entirely by women, planned in consultation with Dr D. J. Mackintosh. The building was practically complete when the decision was taken to run it as a general hospital instead — but the names she had chosen for the wards survived the change of plan, and they are the point. The medical ward, opened on 4 August 1903, was named for Sophia Jex-Blake, who forced British universities to open medicine to women. The surgical ward, opened the following year, was named for Florence Nightingale.",
      "The hospital is a listed building, with its nurses' home listed separately — a small, deliberate monument to Isabella Elder's lifelong conviction that medicine and learning belonged to women as much as to men."
    ],
    quickFacts: [
      {
        label: "Designed",
        value: "1901–02, by Sir John James Burnet"
      },
      {
        label: "Opened",
        value: "Medical ward, 4 August 1903"
      },
      {
        label: "Wards named for",
        value: "Sophia Jex-Blake and Florence Nightingale"
      },
      {
        label: "Built by",
        value: "Isabella Elder, in memory of John Elder"
      }
    ],
    lat: 55.8601,
    lng: -4.3281,
    coordNote: "Subject: Historic Environment Scotland place 162817 (Elder Cottage Hospital, 1a Drumoyne Drive, NGR 254408 665497, 55.86060,-4.32778), next to the unnamed OSM building way 1287974025. Atlas point kept: it lies on Drumoyne Drive (OSM way 14351029, ~2 m from the centreline), the street the hospital fronts, ~59 m from the HES point with the building in view.",
    then: thenFrom(OS_SIX_INCH, "elder-cottage-hospital"),
  }
];

const bySlug = new Map(stops.map((s) => [s.slug, s]));

export function getStop(slug: string): Stop | undefined {
  return bySlug.get(slug);
}
