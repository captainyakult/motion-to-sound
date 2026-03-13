export type EngineState = "idle" | "accelerating" | "decelerating";

export interface AudioBlend {
  idleVolume: number;
  accelVolume: number;
  decelVolume: number;
  engineState: EngineState;
  playbackRate: number;
}

// Smoothing factor (0-1). Lower = smoother/slower response
const SMOOTHING = 0.15;

let previousNormalized = 0;
let smoothedNormalized = 0;

export function resetMappingState() {
  previousNormalized = 0;
  smoothedNormalized = 0;
}

export function mapAccelerationToAudio(normalized: number): AudioBlend {
  // Smooth the input
  smoothedNormalized += SMOOTHING * (normalized - smoothedNormalized);

  // Determine engine state from rate of change
  const delta = smoothedNormalized - previousNormalized;
  previousNormalized = smoothedNormalized;

  let engineState: EngineState;
  if (smoothedNormalized < 0.05) {
    engineState = "idle";
  } else if (delta > 0.001) {
    engineState = "accelerating";
  } else if (delta < -0.001) {
    engineState = "decelerating";
  } else {
    // Maintaining speed — lean toward current state
    engineState = smoothedNormalized > 0.3 ? "accelerating" : "idle";
  }

  // Compute blend volumes
  let idleVolume: number;
  let accelVolume: number;
  let decelVolume: number;

  switch (engineState) {
    case "idle":
      idleVolume = 1.0 - smoothedNormalized * 0.5;
      accelVolume = smoothedNormalized * 0.5;
      decelVolume = 0;
      break;
    case "accelerating":
      idleVolume = Math.max(0, 1.0 - smoothedNormalized * 1.5);
      accelVolume = Math.min(1, smoothedNormalized * 1.5);
      decelVolume = 0;
      break;
    case "decelerating":
      idleVolume = Math.max(0, 1.0 - smoothedNormalized);
      accelVolume = 0;
      decelVolume = Math.min(1, smoothedNormalized * 1.2);
      break;
  }

  // Playback rate: 0.8 at idle → 1.5 at full throttle
  const playbackRate = 0.8 + smoothedNormalized * 0.7;

  return {
    idleVolume,
    accelVolume,
    decelVolume,
    engineState,
    playbackRate,
  };
}
