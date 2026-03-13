export interface VelocityData {
  speed: number; // m/s from GPS
  smoothedSpeed: number; // after EMA smoothing
  normalized: number; // 0-1 (0 = stopped, 1 = MAX_SPEED)
  accuracy: number | null; // GPS accuracy in meters
  source: "gps" | "manual";
}

export type GpsPermissionState = "prompt" | "granted" | "denied" | "not-supported";

// Bicycle max speed ~30 km/h ≈ 8.3 m/s, but user specified 3 m/s as max
export const MAX_SPEED = 3; // m/s

// Exponential moving average smoothing factor (0-1). Lower = smoother.
const SMOOTHING_FACTOR = 0.2;

let smoothedSpeed = 0;
let watchId: number | null = null;
let onUpdate: ((data: VelocityData) => void) | null = null;

export function resetVelocityState() {
  smoothedSpeed = 0;
}

export function smoothSpeed(rawSpeed: number): number {
  smoothedSpeed += SMOOTHING_FACTOR * (rawSpeed - smoothedSpeed);
  return smoothedSpeed;
}

export function normalizeSpeed(speed: number): number {
  return Math.min(1, Math.max(0, speed / MAX_SPEED));
}

export function processManualSpeed(rawSpeed: number): VelocityData {
  const sm = smoothSpeed(rawSpeed);
  return {
    speed: rawSpeed,
    smoothedSpeed: sm,
    normalized: normalizeSpeed(sm),
    accuracy: null,
    source: "manual",
  };
}

function handleGpsPosition(position: GeolocationPosition): void {
  // GPS provides speed in m/s (null if unavailable)
  const rawSpeed = position.coords.speed ?? 0;
  const clamped = Math.max(0, rawSpeed);
  const sm = smoothSpeed(clamped);

  const data: VelocityData = {
    speed: clamped,
    smoothedSpeed: sm,
    normalized: normalizeSpeed(sm),
    accuracy: position.coords.accuracy,
    source: "gps",
  };

  onUpdate?.(data);
}

function handleGpsError(error: GeolocationPositionError): void {
  console.warn("GPS error:", error.message);
}

export async function requestGpsPermission(): Promise<GpsPermissionState> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return "not-supported";
  }

  try {
    // Try to get a position to trigger the permission prompt
    await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    });
    return "granted";
  } catch (err) {
    const geoErr = err as GeolocationPositionError;
    if (geoErr.code === geoErr.PERMISSION_DENIED) return "denied";
    // Timeout or position unavailable — GPS exists but couldn't get fix
    return "granted";
  }
}

export function startGpsTracking(callback: (data: VelocityData) => void): void {
  onUpdate = callback;

  watchId = navigator.geolocation.watchPosition(handleGpsPosition, handleGpsError, {
    enableHighAccuracy: true,
    maximumAge: 1000,
    timeout: 5000,
  });
}

export function stopGpsTracking(): void {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  onUpdate = null;
}
