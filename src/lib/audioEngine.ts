import * as Tone from "tone";
import type { AudioBlend } from "./mapping";

export class EngineAudioController {
  private idlePlayer: Tone.Player | null = null;
  private accelPlayer: Tone.Player | null = null;
  private decelPlayer: Tone.Player | null = null;
  private idleGain: Tone.Gain | null = null;
  private accelGain: Tone.Gain | null = null;
  private decelGain: Tone.Gain | null = null;
  private _loaded = false;
  private _started = false;

  get loaded() {
    return this._loaded;
  }

  get started() {
    return this._started;
  }

  async load() {
    try {
      this.idleGain = new Tone.Gain(1).toDestination();
      this.accelGain = new Tone.Gain(0).toDestination();
      this.decelGain = new Tone.Gain(0).toDestination();

      this.idlePlayer = new Tone.Player({
        url: "/audio/engine_idle.wav",
        loop: true,
      }).connect(this.idleGain);

      this.accelPlayer = new Tone.Player({
        url: "/audio/engine_accelerate.wav",
        loop: true,
      }).connect(this.accelGain);

      this.decelPlayer = new Tone.Player({
        url: "/audio/engine_decelerate.wav",
        loop: true,
      }).connect(this.decelGain);

      await Tone.loaded();
      this._loaded = true;
    } catch (err) {
      console.error("Failed to load audio samples:", err);
      throw err;
    }
  }

  async start() {
    if (!this._loaded) return;
    await Tone.start();
    this.idlePlayer?.start();
    this.accelPlayer?.start();
    this.decelPlayer?.start();
    this._started = true;
  }

  stop() {
    this.idlePlayer?.stop();
    this.accelPlayer?.stop();
    this.decelPlayer?.stop();
    this._started = false;
  }

  setThrottle(blend: AudioBlend) {
    if (!this._started) return;

    const rampTime = 0.1; // seconds for smooth transition

    this.idleGain?.gain.rampTo(blend.idleVolume, rampTime);
    this.accelGain?.gain.rampTo(blend.accelVolume, rampTime);
    this.decelGain?.gain.rampTo(blend.decelVolume, rampTime);

    // Adjust playback rate for RPM feel
    if (this.idlePlayer) this.idlePlayer.playbackRate = blend.playbackRate;
    if (this.accelPlayer) this.accelPlayer.playbackRate = blend.playbackRate;
    if (this.decelPlayer) this.decelPlayer.playbackRate = blend.playbackRate;
  }

  dispose() {
    this.stop();
    this.idlePlayer?.dispose();
    this.accelPlayer?.dispose();
    this.decelPlayer?.dispose();
    this.idleGain?.dispose();
    this.accelGain?.dispose();
    this.decelGain?.dispose();
    this._loaded = false;
    this._started = false;
  }
}
