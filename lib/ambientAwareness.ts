/**
 * Refueler — Passive Ambient Awareness Engine
 * Session 17 · lib/ambientAwareness.ts
 *
 * Runs entirely on-device.
 * Zero location data is ever transmitted to Refueler servers.
 *
 * Flow:
 *   1. Geofence polygon check — is the user at/approaching Limehouse?
 *   2. Velocity + bearing check — moving toward Fenchurch Street?
 *   3. Darwin STOMP query — real-time train ETA for precision timing
 *   4. Active order check — is there something to confirm?
 *   5. Fire ambient trigger → caller handles push notification
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LatLng {
  lat: number;
  lng: number;
}

export interface DeviceMotionSnapshot {
  coords: {
    latitude: number;
    longitude: number;
    speed: number | null;       // m/s — null if unavailable
    heading: number | null;     // degrees true north — null if unavailable
    accuracy: number;           // metres
  };
  timestamp: number;            // epoch ms
}

export interface DarwinTrainService {
  serviceId: string;
  rid: string;                  // RTTI service ID
  platform: string | null;
  etd: string;                  // "On time" | "Delayed" | "HH:MM"
  etaFenchurchStreet: Date | null;
  cancelled: boolean;
}

export interface AmbientTriggerPayload {
  orderId: string;
  itemLabel: string;            // e.g. "flat white medium"
  venueId: string;
  etaSeconds: number;           // seconds until arrival at Fenchurch Street
  etaSource: 'darwin' | 'fallback_segment';
  triggeredAt: Date;
  trainServiceId: string | null;
}

export type AmbientTriggerCallback = (payload: AmbientTriggerPayload) => void;

// ---------------------------------------------------------------------------
// Constants — sourced from corridor registry
// ---------------------------------------------------------------------------

import { getStationByCRS, getRouteToLondon } from './corridor';

// Resolve station data from registry — single source of truth
const _limehouse = getStationByCRS('LHS')!;
const _fenchurchSt = getStationByCRS('FST')!;

/**
 * Limehouse station geofence polygon.
 * Sourced from corridor.ts — do not duplicate here.
 * CTO note: tighten polygon after field test.
 */
export const LIMEHOUSE_GEOFENCE: LatLng[] = _limehouse.geofence.polygon;

/**
 * Fenchurch Street station centroid — used for bearing check.
 */
export const FENCHURCH_STREET: LatLng = _fenchurchSt.geofence.centroid;

/**
 * Returns the geofence polygon for any corridor station by CRS code.
 * Used for future per-station ambient trigger expansion beyond Limehouse.
 */
export function getStationGeofence(crs: string): LatLng[] {
  return getStationByCRS(crs)?.geofence.polygon ?? [];
}

/**
 * Returns the fallback ETA in seconds for any station on the corridor.
 * Replaces the hardcoded FALLBACK_SEGMENT_SECONDS for multi-station use.
 */
export function getFallbackEtaSeconds(crs: string): number {
  const station = getStationByCRS(crs);
  return station ? station.avgMinutesToFenchurch * 60 : FALLBACK_SEGMENT_SECONDS;
}

/**
 * Bearing from Limehouse to Fenchurch Street ≈ 270° (due west).
 * Accept ±35° either side.
 */
export const FENCHURCH_BEARING_DEG = 270;
export const BEARING_TOLERANCE_DEG = 35;

/**
 * Minimum speed to be considered "on a train" rather than walking.
 * London walk ~1.4 m/s. Trains depart Limehouse ~8–12 m/s.
 * Threshold set at 4 m/s to catch slow station exits too.
 */
export const MIN_TRAIN_SPEED_MS = 4.0;

/**
 * Fallback segment time: Limehouse → Fenchurch Street.
 * 2 stops, ~4 minutes typical.
 * Used only if Darwin STOMP is unavailable.
 */
export const FALLBACK_SEGMENT_SECONDS = 240;

/**
 * Darwin STOMP credentials — injected at runtime from env/config.
 * NEVER hardcoded. See .env.local / Supabase Vault.
 */
export interface DarwinConfig {
  stompBrokerUrl: string;   // wss://datafeeds.networkrail.co.uk/...
  username: string;
  passcode: string;
  limehouseCRS: string;     // "LHS"
  fenchurchCRS: string;     // "FST"
}

// ---------------------------------------------------------------------------
// Geofence — point-in-polygon (ray casting)
// ---------------------------------------------------------------------------

/**
 * Returns true if point is inside the polygon defined by vertices.
 * Uses ray casting algorithm. Handles edge cases for convex + concave polygons.
 */
export function isInsideGeofence(point: LatLng, polygon: LatLng[]): boolean {
  const { lat: px, lng: py } = point;
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lng;
    const xj = polygon[j].lat, yj = polygon[j].lng;

    const intersects =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

// ---------------------------------------------------------------------------
// Bearing calculation
// ---------------------------------------------------------------------------

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Returns bearing in degrees (0–360) from `from` to `to`.
 */
export function bearingBetween(from: LatLng, to: LatLng): number {
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Returns true if `heading` is within `tolerance` degrees of `target`.
 */
export function isHeadingToward(
  heading: number,
  target: number,
  tolerance: number
): boolean {
  const diff = Math.abs(((heading - target + 540) % 360) - 180);
  return diff <= tolerance;
}

// ---------------------------------------------------------------------------
// Darwin STOMP — real-time train ETA
// ---------------------------------------------------------------------------

/**
 * Queries Darwin STOMP feed for the next Fenchurch St-bound service
 * calling at Limehouse.
 *
 * Network Rail Darwin uses ActiveMQ STOMP over WebSocket.
 * Topic: /topic/TRAIN_MVT_ALL_TOC  (movement events)
 * Alternative: TD feed or Push Port XML if movement feed latency too high.
 *
 * Returns the soonest non-cancelled service and its ETA at Fenchurch Street.
 * Returns null if no service found or connection fails (caller uses fallback).
 *
 * NOTE: Darwin STOMP connection is opened, queried, and closed each call.
 * Do NOT hold a persistent WebSocket — battery and data cost too high for
 * a background-only feature.
 */
export async function queryDarwinETA(
  config: DarwinConfig,
  timeoutMs = 8000
): Promise<DarwinTrainService | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      // Timeout — caller will use fallback segment time
      resolve(null);
    }, timeoutMs);

    try {
      // Darwin STOMP connection via standard WebSocket STOMP client.
      // Using @stomp/stompjs (already in package.json from Darwin bridge work).
      // Dynamic import keeps this module tree-shakeable for non-ambient builds.
      import('@stomp/stompjs').then(({ Client }) => {
        const client = new Client({
          brokerURL: config.stompBrokerUrl,
          connectHeaders: {
            login: config.username,
            passcode: config.passcode,
          },
          reconnectDelay: 0,    // no reconnect — single query pattern
          heartbeatIncoming: 0,
          heartbeatOutgoing: 0,
        });

        client.onConnect = () => {
          // Subscribe to Darwin Push Port — departure board for Limehouse (LHS)
          // Topic publishes JSON arrays of calling-point services.
          client.subscribe(
            `/topic/darwin.departures.${config.limehouseCRS}`,
            (frame) => {
              try {
                const services: DarwinTrainService[] = parseDarwinDepartureFrame(
                  frame.body,
                  config.fenchurchCRS
                );

                const next = services
                  .filter((s) => !s.cancelled && s.etaFenchurchStreet !== null)
                  .sort(
                    (a, b) =>
                      (a.etaFenchurchStreet!.getTime()) -
                      (b.etaFenchurchStreet!.getTime())
                  )[0] ?? null;

                clearTimeout(timer);
                client.deactivate();
                resolve(next);
              } catch {
                clearTimeout(timer);
                client.deactivate();
                resolve(null);
              }
            }
          );
        };

        client.onStompError = () => {
          clearTimeout(timer);
          client.deactivate();
          resolve(null);
        };

        client.activate();
      }).catch(() => {
        clearTimeout(timer);
        resolve(null);
      });
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

/**
 * Parses a Darwin departure board frame body.
 * Extracts services that call at `destinationCRS` (Fenchurch Street = "FST").
 *
 * Darwin Push Port XML is converted to JSON by the existing Darwin bridge
 * (darwin-stomp-bridge worker). Frame body is expected as JSON string here.
 * If your bridge outputs raw XML, add an XML parser step before this.
 */
function parseDarwinDepartureFrame(
  frameBody: string,
  destinationCRS: string
): DarwinTrainService[] {
  try {
    const data = JSON.parse(frameBody);
    const services = Array.isArray(data.services) ? data.services : [];

    return services
      .filter((s: any) =>
        Array.isArray(s.callingPoints) &&
        s.callingPoints.some((cp: any) => cp.crs === destinationCRS)
      )
      .map((s: any) => {
        const destPoint = s.callingPoints.find(
          (cp: any) => cp.crs === destinationCRS
        );
        const etaStr: string | null = destPoint?.eta ?? destPoint?.sta ?? null;

        let etaDate: Date | null = null;
        if (etaStr && /^\d{2}:\d{2}$/.test(etaStr)) {
          const now = new Date();
          const [hh, mm] = etaStr.split(':').map(Number);
          etaDate = new Date(now);
          etaDate.setHours(hh, mm, 0, 0);
          // Handle midnight rollover
          if (etaDate < now) etaDate.setDate(etaDate.getDate() + 1);
        }

        return {
          serviceId: s.serviceId ?? '',
          rid: s.rid ?? '',
          platform: s.platform ?? null,
          etd: s.etd ?? 'Unknown',
          etaFenchurchStreet: etaDate,
          cancelled: !!(s.cancelled || s.isCancelled),
        } satisfies DarwinTrainService;
      });
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Active order check
// ---------------------------------------------------------------------------

export interface PendingOrder {
  orderId: string;
  itemLabel: string;
  venueId: string;
  status: 'pending' | 'paid' | 'confirmed';
}

/**
 * Returns the most recent active (pre-confirmation) order, if any.
 * Reads from local device storage only — never from Supabase at trigger time.
 *
 * Storage key: 'refueler-pending-order' (set by order flow on save)
 * Value: JSON-encoded PendingOrder
 */
export function getActivePendingOrder(): PendingOrder | null {
  try {
    // React Native: use @react-native-async-storage/async-storage
    // Web/PWA preview: localStorage (replace with AsyncStorage in native build)
    const raw = localStorage.getItem('refueler-pending-order');
    if (!raw) return null;
    const order = JSON.parse(raw) as PendingOrder;
    // Only trigger for pending orders — not already-paid or confirmed
    return order.status === 'pending' ? order : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Ambient trigger flag — prevent duplicate notifications in same journey
// ---------------------------------------------------------------------------

const TRIGGER_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

function getLastTriggerTime(): number {
  try {
    return parseInt(localStorage.getItem('refueler-ambient-last-trigger') ?? '0', 10);
  } catch {
    return 0;
  }
}

function setLastTriggerTime(): void {
  try {
    localStorage.setItem(
      'refueler-ambient-last-trigger',
      String(Date.now())
    );
  } catch {
    // non-fatal
  }
}

function isCoolingDown(): boolean {
  return Date.now() - getLastTriggerTime() < TRIGGER_COOLDOWN_MS;
}

// ---------------------------------------------------------------------------
// Opt-in flag
// ---------------------------------------------------------------------------

/**
 * Returns true if user has opted in to ambient ordering.
 * Set during onboarding. Toggle in Settings → Notifications → Ambient ordering.
 * Stored locally only — never in Supabase.
 */
export function isAmbientEnabled(): boolean {
  try {
    return localStorage.getItem('refueler-ambient-enabled') === 'true';
  } catch {
    return false;
  }
}

export function setAmbientEnabled(enabled: boolean): void {
  try {
    localStorage.setItem('refueler-ambient-enabled', String(enabled));
  } catch {
    // non-fatal
  }
}

// ---------------------------------------------------------------------------
// Core evaluation function — call this on each location update
// ---------------------------------------------------------------------------

/**
 * Evaluate a device location snapshot for ambient trigger conditions.
 *
 * Call this from your location update handler (background task / geofence
 * region monitoring callback). Designed to be cheap — exits fast on negative
 * conditions before doing any async work.
 *
 * Returns the trigger payload if all conditions are met and fires `onTrigger`.
 * Returns null otherwise.
 *
 * @param snapshot     Latest device location + motion reading
 * @param darwinConfig Darwin STOMP credentials (from env/config)
 * @param onTrigger    Callback — fires push notification, updates UI
 */
export async function evaluateAmbientTrigger(
  snapshot: DeviceMotionSnapshot,
  darwinConfig: DarwinConfig,
  onTrigger: AmbientTriggerCallback
): Promise<AmbientTriggerPayload | null> {

  // --- Fast exits (synchronous) ---

  // 1. Feature opt-in
  if (!isAmbientEnabled()) return null;

  // 2. Cooldown — don't re-trigger within same journey window
  if (isCoolingDown()) return null;

  // 3. Active order — nothing to confirm if no pending order
  const order = getActivePendingOrder();
  if (!order) return null;

  // 4. Geofence — is the user at Limehouse?
  const position: LatLng = {
    lat: snapshot.coords.latitude,
    lng: snapshot.coords.longitude,
  };
  if (!isInsideGeofence(position, LIMEHOUSE_GEOFENCE)) return null;

  // 5. Speed — are they on a train rather than walking through?
  const speed = snapshot.coords.speed ?? 0;
  if (speed < MIN_TRAIN_SPEED_MS) return null;

  // 6. Bearing — moving toward Fenchurch Street?
  const deviceHeading = snapshot.coords.heading;
  if (deviceHeading !== null) {
    const targetBearing = bearingBetween(position, FENCHURCH_STREET);
    if (!isHeadingToward(deviceHeading, targetBearing, BEARING_TOLERANCE_DEG)) {
      return null;
    }
  }
  // Note: if heading is null (GPS no-heading), we trust geofence + speed alone.
  // Acceptable risk — Limehouse platform geometry makes westward travel near-certain.

  // --- Async: Darwin STOMP ETA query ---
  let etaSeconds = FALLBACK_SEGMENT_SECONDS;
  let etaSource: AmbientTriggerPayload['etaSource'] = 'fallback_segment';
  let trainServiceId: string | null = null;

  const darwinService = await queryDarwinETA(darwinConfig);

  if (darwinService?.etaFenchurchStreet) {
    const nowMs = Date.now();
    const etaMs = darwinService.etaFenchurchStreet.getTime();
    const derivedSeconds = Math.round((etaMs - nowMs) / 1000);

    // Sanity bounds: 60s–900s (1–15 mins). Reject outliers.
    if (derivedSeconds >= 60 && derivedSeconds <= 900) {
      etaSeconds = derivedSeconds;
      etaSource = 'darwin';
      trainServiceId = darwinService.serviceId;
    }
  }

  // --- All conditions met — fire trigger ---

  setLastTriggerTime();

  const payload: AmbientTriggerPayload = {
    orderId: order.orderId,
    itemLabel: order.itemLabel,
    venueId: order.venueId,
    etaSeconds,
    etaSource,
    triggeredAt: new Date(),
    trainServiceId,
  };

  onTrigger(payload);
  return payload;
}

// ---------------------------------------------------------------------------
// Location watcher — thin wrapper over Geolocation API / React Native
// ---------------------------------------------------------------------------

/**
 * Starts watching device location and calls `evaluateAmbientTrigger` on each
 * update.
 *
 * In React Native, replace `navigator.geolocation` with
 * `react-native-background-geolocation` or `expo-location` (background task).
 *
 * Returns a cleanup function — call on component unmount or background task end.
 */
export function startAmbientWatcher(
  darwinConfig: DarwinConfig,
  onTrigger: AmbientTriggerCallback,
  onError?: (err: GeolocationPositionError) => void
): () => void {
  if (!('geolocation' in navigator)) {
    console.warn('[Refueler] Geolocation not available on this platform.');
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const snapshot: DeviceMotionSnapshot = {
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
          accuracy: position.coords.accuracy,
        },
        timestamp: position.timestamp,
      };

      // Fire-and-forget — don't await in the watcher callback
      evaluateAmbientTrigger(snapshot, darwinConfig, onTrigger).catch(
        (err) => console.error('[Refueler] Ambient trigger error:', err)
      );
    },
    (err) => {
      console.error('[Refueler] Location watcher error:', err);
      onError?.(err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,    // 5s stale tolerance
      timeout: 10000,
    }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}
