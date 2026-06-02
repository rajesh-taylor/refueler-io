/**
 * Refueler — Fenchurch Street Line Corridor Data
 * Session 17 · lib/corridor.ts
 *
 * Complete station dataset for all service patterns on the line.
 * Source: Official route map (Session 17 upload) + ORR station data.
 *
 * THREE MAIN SERVICE PATTERNS:
 *   Service 2 — Fenchurch Street ↔ Stanford-le-Hope (via Grays, limited service branch)
 *   Service 4 — Fenchurch Street ↔ Shoeburyness (via Basildon — main line)
 *   Service 4G — Fenchurch Street ↔ Shoeburyness (via Grays — longer route)
 *
 * LIMITED / DIVERSION SERVICES (weekends, events, engineering works):
 *   London Liverpool Street ↔ Shoeburyness (via Stratford)
 *   London Liverpool Street ↔ Stanford-le-Hope (via Stratford, Grays branch)
 *
 * GEOFENCE NOTES:
 *   Polygons are 80m-radius approximations centred on platform midpoints.
 *   CTO: tighten all after field validation. Limehouse is the only one
 *   currently used for ambient trigger; others needed for ETA calculation
 *   and future per-station ambient expansion.
 *
 * TRADEMARK NOTE:
 *   Internal use only. "C2C" is a registered trademark of Trenitalia c2c Ltd.
 *   All public-facing copy uses "Fenchurch St line" exclusively.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LatLng {
  lat: number;
  lng: number;
}

/** Axis-aligned bounding box — fast pre-filter before ray casting */
export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface StationGeofence {
  /** Platform midpoint — used for bearing + ETA calculations */
  centroid: LatLng;
  /** Polygon vertices for point-in-polygon check */
  polygon: LatLng[];
  /** Pre-computed bounding box for fast rejection */
  bbox: BoundingBox;
}

/** Which main service patterns call at this station */
export type ServicePattern =
  | 'main'          // all services call here
  | 'grays_branch'  // Grays branch only (Stanford-le-Hope, East Tilbury, Tilbury Town)
  | 'basildon_line' // Basildon main line (Laindon, Basildon, Pitsea + coastal)
  | 'diversion'     // Liverpool Street / Stratford (limited / event services)
  | 'junction';     // junction stations called by multiple patterns

/** Off-peak trains per hour, per direction, as shown on route map */
export type FrequencyTph = 2 | 4 | null;

export interface Station {
  /** Internal ID — stable, used in Supabase venues/orders tables */
  id: string;
  /** Display name */
  name: string;
  /** 3-letter CRS code (National Rail standard) */
  crs: string;
  /**
   * Sequence position on the main line, Fenchurch Street = 0.
   * Used for bearing-toward-London checks and ETA chain calculation.
   * Grays branch stations share sequence space — see servicePattern.
   */
  sequence: number;
  /** Zone (1–6 for Oyster/PAYG; null = Oyster not valid) */
  travelcardZone: number | null;
  /** Off-peak frequency toward London (trains per hour) */
  tphToLondon: FrequencyTph;
  /** Service patterns that call here */
  servicePatterns: ServicePattern[];
  /** Geofence data for on-device ambient trigger */
  geofence: StationGeofence;
  /** Darwin STOMP real-time data available for this station */
  darwinEnabled: boolean;
  /**
   * Average journey time from this station to Fenchurch Street, minutes.
   * Used as fallback when Darwin STOMP unavailable.
   * Source: c2c-online.co.uk timetables. Field-validate before investor use †
   */
  avgMinutesToFenchurch: number;
  /** Notes for CTO / ops */
  notes?: string;
}

// ---------------------------------------------------------------------------
// Geofence polygon factory
// Creates an approximate square polygon ~80m around a centroid.
// Replace with precise surveyed polygons post field validation.
// ---------------------------------------------------------------------------

function makeGeofence(centroid: LatLng, radiusMetres = 80): StationGeofence {
  // 1 degree lat ≈ 111,000m. 1 degree lng ≈ 111,000m × cos(lat).
  const dLat = radiusMetres / 111_000;
  const dLng = radiusMetres / (111_000 * Math.cos((centroid.lat * Math.PI) / 180));

  const polygon: LatLng[] = [
    { lat: centroid.lat + dLat, lng: centroid.lng - dLng },
    { lat: centroid.lat + dLat, lng: centroid.lng + dLng },
    { lat: centroid.lat - dLat, lng: centroid.lng + dLng },
    { lat: centroid.lat - dLat, lng: centroid.lng - dLng },
  ];

  return {
    centroid,
    polygon,
    bbox: {
      minLat: centroid.lat - dLat,
      maxLat: centroid.lat + dLat,
      minLng: centroid.lng - dLng,
      maxLng: centroid.lng + dLng,
    },
  };
}

// ---------------------------------------------------------------------------
// STATION DEFINITIONS
// Ordered Fenchurch Street → Shoeburyness (main) / Stanford-le-Hope (branch)
// Diversion stations (Liverpool Street, Stratford) appended at end.
// ---------------------------------------------------------------------------

export const CORRIDOR_STATIONS: Station[] = [

  // ── LONDON TERMINUS ────────────────────────────────────────────────────────

  {
    id: 'fenchurch_street',
    name: 'Fenchurch Street',
    crs: 'FST',
    sequence: 0,
    travelcardZone: 1,
    tphToLondon: null, // terminus
    servicePatterns: ['main'],
    geofence: makeGeofence({ lat: 51.5117, lng: -0.0784 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 0,
    notes: 'Main terminus. Tower Hill 150m, Tower Gateway DLR 200m.',
  },

  // ── INNER LONDON ───────────────────────────────────────────────────────────

  {
    id: 'limehouse',
    name: 'Limehouse',
    crs: 'LHS',
    sequence: 1,
    travelcardZone: 2,
    tphToLondon: 2, // off-peak shown on map (peak higher)
    servicePatterns: ['main'],
    geofence: makeGeofence({ lat: 51.5131, lng: -0.0381 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 4,
    notes: 'PRIMARY AMBIENT TRIGGER STATION. Step free access London-bound platform only. DLR interchange.',
  },

  {
    id: 'west_ham',
    name: 'West Ham',
    crs: 'WEH',
    sequence: 2,
    travelcardZone: 3,
    tphToLondon: 2,
    servicePatterns: ['main'],
    geofence: makeGeofence({ lat: 51.5285, lng: 0.0051 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 10,
    notes: 'Jubilee line + DLR interchange.',
  },

  // ── EAST LONDON / ESSEX BORDER ─────────────────────────────────────────────

  {
    id: 'barking',
    name: 'Barking',
    crs: 'BKG',
    sequence: 3,
    travelcardZone: 4,
    tphToLondon: 4,
    servicePatterns: ['main', 'junction'],
    geofence: makeGeofence({ lat: 51.5396, lng: 0.0808 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 17,
    notes: 'Major junction. District + Hammersmith & City + Overground interchange.',
  },

  {
    id: 'upminster',
    name: 'Upminster',
    crs: 'UPM',
    sequence: 4,
    travelcardZone: 6,
    tphToLondon: 4,
    servicePatterns: ['main', 'junction'],
    geofence: makeGeofence({ lat: 51.5590, lng: 0.2505 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 28,
    notes: 'District line terminus interchange. Zone 6 boundary.',
  },

  {
    id: 'ockendon',
    name: 'Ockendon',
    crs: 'OCK',
    sequence: 5,
    travelcardZone: null, // beyond Zone 6 — Oyster not valid
    tphToLondon: 2,
    servicePatterns: ['main'],
    geofence: makeGeofence({ lat: 51.5218, lng: 0.2937 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 37,
    notes: 'Step free access by arrangement. Oyster/Contactless not valid.',
  },

  {
    id: 'chafford_hundred',
    name: 'Chafford Hundred',
    crs: 'CFH',
    sequence: 6,
    travelcardZone: null,
    tphToLondon: 2,
    servicePatterns: ['main'],
    geofence: makeGeofence({ lat: 51.4907, lng: 0.3048 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 41,
  },

  {
    id: 'grays',
    name: 'Grays',
    crs: 'GRY',
    sequence: 7,
    travelcardZone: null,
    tphToLondon: 4,
    servicePatterns: ['main', 'junction'],
    geofence: makeGeofence({ lat: 51.4773, lng: 0.3232 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 44,
    notes: 'Junction: main line continues to Purfleet; Grays branch splits to Tilbury/Stanford-le-Hope.',
  },

  {
    id: 'purfleet',
    name: 'Purfleet',
    crs: 'PFL',
    sequence: 8,
    travelcardZone: null,
    tphToLondon: 2,
    servicePatterns: ['main'],
    geofence: makeGeofence({ lat: 51.4800, lng: 0.2378 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 50,
  },

  {
    id: 'rainham',
    name: 'Rainham',
    crs: 'RNH',
    sequence: 9,
    travelcardZone: null,
    tphToLondon: 2,
    servicePatterns: ['main'],
    geofence: makeGeofence({ lat: 51.5212, lng: 0.1896 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 35,
  },

  {
    id: 'dagenham_dock',
    name: 'Dagenham Dock',
    crs: 'DDK',
    sequence: 10,
    travelcardZone: null,
    tphToLondon: 2,
    servicePatterns: ['main'],
    geofence: makeGeofence({ lat: 51.5269, lng: 0.1467 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 30,
  },

  // ── GRAYS BRANCH — Stanford-le-Hope service (Service 2) ───────────────────
  // Splits at Grays. 2 tph off-peak on this branch.

  {
    id: 'tilbury_town',
    name: 'Tilbury Town',
    crs: 'TIL',
    sequence: 71, // 7x = Grays branch
    travelcardZone: null,
    tphToLondon: 2,
    servicePatterns: ['grays_branch'],
    geofence: makeGeofence({ lat: 51.4612, lng: 0.3574 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 52,
    notes: 'Ferry connection to Gravesend.',
  },

  {
    id: 'east_tilbury',
    name: 'East Tilbury',
    crs: 'ETL',
    sequence: 72,
    travelcardZone: null,
    tphToLondon: 2,
    servicePatterns: ['grays_branch'],
    geofence: makeGeofence({ lat: 51.4716, lng: 0.4016 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 57,
  },

  {
    id: 'stanford_le_hope',
    name: 'Stanford-le-Hope',
    crs: 'SFO',
    sequence: 73,
    travelcardZone: null,
    tphToLondon: 2,
    servicePatterns: ['grays_branch'],
    geofence: makeGeofence({ lat: 51.5124, lng: 0.4218 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 63,
    notes: 'Terminus for Grays branch / Service 2. PlusBus available.',
  },

  // ── BASILDON MAIN LINE — Shoeburyness service (Service 4) ─────────────────
  // From Upminster junction. 4 tph off-peak to Basildon; 2-4 coastal.

  {
    id: 'laindon',
    name: 'Laindon',
    crs: 'LAI',
    sequence: 41, // 4x = Basildon main line
    travelcardZone: null,
    tphToLondon: 4,
    servicePatterns: ['basildon_line'],
    geofence: makeGeofence({ lat: 51.5695, lng: 0.4229 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 42,
    notes: 'Step free access Southend-bound platform only.',
  },

  {
    id: 'basildon',
    name: 'Basildon',
    crs: 'BSO',
    sequence: 42,
    travelcardZone: null,
    tphToLondon: 4,
    servicePatterns: ['basildon_line'],
    geofence: makeGeofence({ lat: 51.5705, lng: 0.4579 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 46,
    notes: 'PlusBus available.',
  },

  {
    id: 'pitsea',
    name: 'Pitsea',
    crs: 'PSE',
    sequence: 43,
    travelcardZone: null,
    tphToLondon: 4,
    servicePatterns: ['basildon_line'],
    geofence: makeGeofence({ lat: 51.5617, lng: 0.5049 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 50,
  },

  {
    id: 'benfleet',
    name: 'Benfleet',
    crs: 'BEF',
    sequence: 44,
    travelcardZone: null,
    tphToLondon: 4,
    servicePatterns: ['basildon_line'],
    geofence: makeGeofence({ lat: 51.5463, lng: 0.5601 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 54,
    notes: 'PlusBus available.',
  },

  {
    id: 'leigh_on_sea',
    name: 'Leigh-on-Sea',
    crs: 'LES',
    sequence: 45,
    travelcardZone: null,
    tphToLondon: 4,
    servicePatterns: ['basildon_line'],
    geofence: makeGeofence({ lat: 51.5388, lng: 0.6487 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 61,
    notes: 'PlusBus available.',
  },

  {
    id: 'chalkwell',
    name: 'Chalkwell',
    crs: 'CHW',
    sequence: 46,
    travelcardZone: null,
    tphToLondon: 4,
    servicePatterns: ['basildon_line'],
    geofence: makeGeofence({ lat: 51.5381, lng: 0.6719 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 64,
  },

  {
    id: 'westcliff',
    name: 'Westcliff',
    crs: 'WCF',
    sequence: 47,
    travelcardZone: null,
    tphToLondon: 4,
    servicePatterns: ['basildon_line'],
    geofence: makeGeofence({ lat: 51.5375, lng: 0.6887 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 66,
  },

  {
    id: 'southend_central',
    name: 'Southend Central',
    crs: 'SOC',
    sequence: 48,
    travelcardZone: null,
    tphToLondon: 4,
    servicePatterns: ['basildon_line'],
    geofence: makeGeofence({ lat: 51.5358, lng: 0.7100 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 68,
    notes: 'Major coastal hub. PlusBus available.',
  },

  {
    id: 'southend_east',
    name: 'Southend East',
    crs: 'SOE',
    sequence: 49,
    travelcardZone: null,
    tphToLondon: 4,
    servicePatterns: ['basildon_line'],
    geofence: makeGeofence({ lat: 51.5356, lng: 0.7307 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 70,
    notes: 'Step free access London-bound platform only. PlusBus available.',
  },

  {
    id: 'thorpe_bay',
    name: 'Thorpe Bay',
    crs: 'TPB',
    sequence: 50,
    travelcardZone: null,
    tphToLondon: 4,
    servicePatterns: ['basildon_line'],
    geofence: makeGeofence({ lat: 51.5326, lng: 0.7498 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 73,
    notes: 'No step free connection between platforms.',
  },

  {
    id: 'shoeburyness',
    name: 'Shoeburyness',
    crs: 'SRY',
    sequence: 51,
    travelcardZone: null,
    tphToLondon: 4,
    servicePatterns: ['basildon_line'],
    geofence: makeGeofence({ lat: 51.5308, lng: 0.7893 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 78,
    notes: 'Far terminus. Eyebrow label origin station for Refueler copy.',
  },

  // ── DIVERSION / LIMITED SERVICE STATIONS ──────────────────────────────────
  // Liverpool Street and Stratford: used during engineering works, events
  // (Stratford / Queen Elizabeth Olympic Park), weekend diversions.
  // Refueler ambient trigger should handle these gracefully —
  // Darwin service check will return FST or LST as terminus.

  {
    id: 'stratford',
    name: 'Stratford',
    crs: 'SAT',
    sequence: 91, // 9x = diversion stations
    travelcardZone: 3,
    tphToLondon: null, // variable — event/diversion services only
    servicePatterns: ['diversion'],
    geofence: makeGeofence({ lat: 51.5416, lng: -0.0038 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 25, // approx via diversion route
    notes: 'Diversion/event service only. Overground + Elizabeth Line + Jubilee + DLR interchange. Westfield Stratford City + Olympic Park.',
  },

  {
    id: 'liverpool_street',
    name: 'Liverpool Street',
    crs: 'LST',
    sequence: 92,
    travelcardZone: 1,
    tphToLondon: null, // diversion terminus
    servicePatterns: ['diversion'],
    geofence: makeGeofence({ lat: 51.5178, lng: -0.0823 }),
    darwinEnabled: true,
    avgMinutesToFenchurch: 0, // IS the terminus on diversion days
    notes: 'Diversion terminus. Central + Circle + Hammersmith & City + Elizabeth Line + Overground. Used when engineering works close Fenchurch Street.',
  },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/** Lookup by CRS code — O(n), pre-index if needed at scale */
export function getStationByCRS(crs: string): Station | undefined {
  return CORRIDOR_STATIONS.find((s) => s.crs === crs.toUpperCase());
}

/** Lookup by internal ID */
export function getStationById(id: string): Station | undefined {
  return CORRIDOR_STATIONS.find((s) => s.id === id);
}

/** All stations that call on a given service pattern */
export function getStationsByPattern(pattern: ServicePattern): Station[] {
  return CORRIDOR_STATIONS.filter((s) => s.servicePatterns.includes(pattern));
}

/**
 * Returns stations in sequence order between `fromCRS` and `fenchurch_street`.
 * Used to build the ETA chain for per-stop ambient trigger expansion.
 * Handles branch detection — if fromCRS is a Grays branch station, returns
 * branch sequence; otherwise returns main line sequence.
 */
export function getRouteToLondon(fromCRS: string): Station[] {
  const from = getStationByCRS(fromCRS);
  if (!from) return [];

  const isGraysBranch = from.servicePatterns.includes('grays_branch');
  const isBasildonLine = from.servicePatterns.includes('basildon_line');

  let candidates: Station[];

  if (isGraysBranch) {
    // Grays branch: branch stations + main line from Grays inward
    const branchStations = CORRIDOR_STATIONS
      .filter((s) => s.servicePatterns.includes('grays_branch') && s.sequence >= from.sequence)
      .sort((a, b) => a.sequence - b.sequence);
    const mainFromGrays = CORRIDOR_STATIONS
      .filter((s) => s.servicePatterns.includes('main') && s.sequence <= 7 /* Grays */)
      .sort((a, b) => a.sequence - b.sequence);
    candidates = [...branchStations, ...mainFromGrays];
  } else if (isBasildonLine) {
    // Basildon main line: basildon stations + main line from Upminster inward
    const basildonStations = CORRIDOR_STATIONS
      .filter((s) => s.servicePatterns.includes('basildon_line') && s.sequence >= from.sequence)
      .sort((a, b) => a.sequence - b.sequence);
    const mainFromUpminster = CORRIDOR_STATIONS
      .filter((s) => s.servicePatterns.includes('main') && s.sequence <= 4 /* Upminster */)
      .sort((a, b) => a.sequence - b.sequence);
    candidates = [...basildonStations, ...mainFromUpminster];
  } else {
    // Main line — simple sequence filter
    candidates = CORRIDOR_STATIONS
      .filter(
        (s) =>
          s.servicePatterns.includes('main') &&
          s.sequence >= from.sequence &&
          !s.servicePatterns.includes('diversion')
      )
      .sort((a, b) => a.sequence - b.sequence);
  }

  return candidates;
}

// ---------------------------------------------------------------------------
// Supabase migration helper — seed data for `stations` table
// ---------------------------------------------------------------------------

/**
 * Generates the VALUES clause for the Supabase `stations` table seed migration.
 *
 * Run: console.log(generateStationsSeedSQL()) and paste into a migration file.
 *
 * Table schema expected:
 *   id TEXT PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   crs TEXT NOT NULL UNIQUE,
 *   sequence INT,
 *   travelcard_zone INT,
 *   tph_to_london INT,
 *   service_patterns TEXT[],
 *   centroid_lat FLOAT,
 *   centroid_lng FLOAT,
 *   darwin_enabled BOOL DEFAULT true,
 *   avg_minutes_to_fenchurch INT,
 *   notes TEXT
 */
export function generateStationsSeedSQL(): string {
  const rows = CORRIDOR_STATIONS.map((s) => {
    const patterns = `ARRAY[${s.servicePatterns.map((p) => `'${p}'`).join(', ')}]`;
    const zone = s.travelcardZone ?? 'NULL';
    const tph = s.tphToLondon ?? 'NULL';
    const notes = s.notes ? `'${s.notes.replace(/'/g, "''")}'` : 'NULL';
    return (
      `  ('${s.id}', '${s.name}', '${s.crs}', ${s.sequence}, ` +
      `${zone}, ${tph}, ${patterns}, ` +
      `${s.geofence.centroid.lat}, ${s.geofence.centroid.lng}, ` +
      `${s.darwinEnabled}, ${s.avgMinutesToFenchurch}, ${notes})`
    );
  });

  return (
    `-- Refueler corridor stations seed — Session 17\n` +
    `-- Generated from lib/corridor.ts CORRIDOR_STATIONS\n` +
    `INSERT INTO stations (\n` +
    `  id, name, crs, sequence, travelcard_zone, tph_to_london,\n` +
    `  service_patterns, centroid_lat, centroid_lng,\n` +
    `  darwin_enabled, avg_minutes_to_fenchurch, notes\n` +
    `) VALUES\n` +
    rows.join(',\n') +
    `\nON CONFLICT (id) DO UPDATE SET\n` +
    `  name = EXCLUDED.name,\n` +
    `  crs = EXCLUDED.crs,\n` +
    `  avg_minutes_to_fenchurch = EXCLUDED.avg_minutes_to_fenchurch;`
  );
}
