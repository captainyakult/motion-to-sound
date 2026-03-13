export interface MotionData {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  normalized: number;
}

export interface MotionConfig {
  maxExpectedAccel: number;
}

const DEFAULT_CONFIG: MotionConfig = {
  maxExpectedAccel: 20, // m/s² — reasonable max for hand-held phone movement
};

export function calculateMagnitude(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
}

export function normalizeAcceleration(
  magnitude: number,
  maxExpectedAccel: number
): number {
  return Math.min(1, Math.max(0, magnitude / maxExpectedAccel));
}

export function processMotionEvent(
  event: DeviceMotionEvent,
  config: MotionConfig = DEFAULT_CONFIG
): MotionData {
  const accel = event.accelerationIncludingGravity;
  const x = accel?.x ?? 0;
  const y = accel?.y ?? 0;
  const z = accel?.z ?? 0;

  // Subtract approximate gravity (~9.8) from magnitude to get motion-only acceleration
  const rawMagnitude = calculateMagnitude(x, y, z);
  const magnitude = Math.max(0, rawMagnitude - 9.8);
  const normalized = normalizeAcceleration(magnitude, config.maxExpectedAccel);

  return { x, y, z, magnitude, normalized };
}

export type MotionPermissionState = "prompt" | "granted" | "denied" | "not-supported";

export async function requestMotionPermission(): Promise<MotionPermissionState> {
  if (typeof window === "undefined") return "not-supported";

  // Check if DeviceMotionEvent is available
  if (!("DeviceMotionEvent" in window)) return "not-supported";

  // iOS 13+ requires permission request
  const DME = DeviceMotionEvent as unknown as {
    requestPermission?: () => Promise<string>;
  };
  if (typeof DME.requestPermission === "function") {
    try {
      const result = await DME.requestPermission();
      return result === "granted" ? "granted" : "denied";
    } catch {
      return "denied";
    }
  }

  // Android / other browsers — permission granted implicitly
  return "granted";
}
