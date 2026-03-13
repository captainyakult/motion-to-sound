export type EngineState = "idle" | "accelerating" | "decelerating";

export interface VelocityAudioState {
  engineState: EngineState;
  frequency: number; // Hz (50-1000)
  normalized: number; // 0-1 speed
}

const MIN_FREQ = 50;
const MAX_FREQ = 1000;

let previousNormalized = 0;

export function resetMappingState() {
  previousNormalized = 0;
}

export function mapVelocityToAudio(normalized: number): VelocityAudioState {
  const delta = normalized - previousNormalized;
  previousNormalized = normalized;

  let engineState: EngineState;
  if (normalized < 0.02) {
    engineState = "idle";
  } else if (delta > 0.005) {
    engineState = "accelerating";
  } else if (delta < -0.005) {
    engineState = "decelerating";
  } else {
    engineState = normalized > 0.1 ? "accelerating" : "idle";
  }

  const frequency = MIN_FREQ + normalized * (MAX_FREQ - MIN_FREQ);

  return { engineState, frequency, normalized };
}
