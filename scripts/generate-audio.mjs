import WavEncoder from "wav-encoder";
import { writeFileSync, mkdirSync } from "fs";

const SAMPLE_RATE = 44100;
const DURATION = 4; // seconds

function generateSamples(duration, fn) {
  const length = SAMPLE_RATE * duration;
  const buffer = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    buffer[i] = fn(t);
  }
  return buffer;
}

// Engine idle: low rumble with slight variation
function engineIdle(t) {
  const fundamental = 35; // Hz — low idle rumble
  let sample = 0;
  // Fundamental + harmonics for engine character
  sample += 0.4 * Math.sin(2 * Math.PI * fundamental * t);
  sample += 0.25 * Math.sin(2 * Math.PI * fundamental * 2 * t);
  sample += 0.15 * Math.sin(2 * Math.PI * fundamental * 3 * t);
  sample += 0.1 * Math.sin(2 * Math.PI * fundamental * 4 * t);
  // Slight flutter/variation
  const flutter = 1 + 0.03 * Math.sin(2 * Math.PI * 2.5 * t);
  sample *= flutter;
  // Add some noise for realism
  sample += 0.05 * (Math.random() * 2 - 1);
  return sample * 0.6;
}

// Engine accelerating: higher frequency, more harmonics, aggressive
function engineAccelerate(t) {
  const fundamental = 65; // Hz — revving
  let sample = 0;
  sample += 0.35 * Math.sin(2 * Math.PI * fundamental * t);
  sample += 0.3 * Math.sin(2 * Math.PI * fundamental * 2 * t);
  sample += 0.2 * Math.sin(2 * Math.PI * fundamental * 3 * t);
  sample += 0.15 * Math.sin(2 * Math.PI * fundamental * 4 * t);
  sample += 0.1 * Math.sin(2 * Math.PI * fundamental * 5 * t);
  sample += 0.08 * Math.sin(2 * Math.PI * fundamental * 6 * t);
  // Add growl texture
  const growl = 0.1 * Math.sin(2 * Math.PI * 15 * t) * Math.sin(2 * Math.PI * fundamental * t);
  sample += growl;
  // More noise for aggressive character
  sample += 0.08 * (Math.random() * 2 - 1);
  return sample * 0.7;
}

// Engine decelerating: mid frequency, fading harmonics
function engineDecelerate(t) {
  const fundamental = 50; // Hz
  let sample = 0;
  sample += 0.35 * Math.sin(2 * Math.PI * fundamental * t);
  sample += 0.2 * Math.sin(2 * Math.PI * fundamental * 2 * t);
  sample += 0.12 * Math.sin(2 * Math.PI * fundamental * 3 * t);
  // Popping/burble on decel
  const pop = 0.06 * Math.sin(2 * Math.PI * 8 * t) * Math.sin(2 * Math.PI * fundamental * 1.5 * t);
  sample += pop;
  sample += 0.04 * (Math.random() * 2 - 1);
  return sample * 0.55;
}

// Apply crossfade at loop boundaries for seamless looping
function applyCrossfade(buffer, fadeSamples = 4410) {
  for (let i = 0; i < fadeSamples; i++) {
    const ratio = i / fadeSamples;
    const endIdx = buffer.length - fadeSamples + i;
    buffer[i] = buffer[i] * ratio + buffer[endIdx] * (1 - ratio);
  }
  return buffer;
}

async function generateFile(name, fn) {
  let samples = generateSamples(DURATION, fn);
  samples = applyCrossfade(samples);

  const wavData = await WavEncoder.encode({
    sampleRate: SAMPLE_RATE,
    channelData: [samples],
  });

  writeFileSync(`public/audio/${name}.wav`, Buffer.from(wavData));
  console.log(`Generated ${name}.wav`);
}

mkdirSync("public/audio", { recursive: true });

await generateFile("engine_idle", engineIdle);
await generateFile("engine_accelerate", engineAccelerate);
await generateFile("engine_decelerate", engineDecelerate);

console.log("All audio files generated!");
