import * as Tone from "tone";

const MIN_FREQ = 50; // Hz — idle tone
const MAX_FREQ = 1000; // Hz — max speed tone

export class ToneAudioController {
  private oscillator: Tone.Oscillator | null = null;
  private gainNode: Tone.Gain | null = null;
  private _started = false;
  private _currentFreq = MIN_FREQ;

  get started() {
    return this._started;
  }

  get currentFrequency() {
    return this._currentFreq;
  }

  async start() {
    await Tone.start();

    this.gainNode = new Tone.Gain(0.4).toDestination();
    this.oscillator = new Tone.Oscillator({
      frequency: MIN_FREQ,
      type: "sine",
    }).connect(this.gainNode);

    this.oscillator.start();
    this._started = true;
    this._currentFreq = MIN_FREQ;
  }

  stop() {
    this.oscillator?.stop();
    this.oscillator?.dispose();
    this.gainNode?.dispose();
    this.oscillator = null;
    this.gainNode = null;
    this._started = false;
  }

  /** Set frequency based on normalized speed (0-1) */
  setFrequency(normalized: number) {
    if (!this._started || !this.oscillator) return;

    const freq = MIN_FREQ + normalized * (MAX_FREQ - MIN_FREQ);
    this._currentFreq = freq;
    this.oscillator.frequency.rampTo(freq, 0.1);
  }

  dispose() {
    this.stop();
  }
}
