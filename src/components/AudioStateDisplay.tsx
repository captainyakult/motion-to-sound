"use client";

import type { AudioBlend } from "@/lib/mapping";

interface Props {
  blend: AudioBlend;
  audioLoaded: boolean;
  audioStarted: boolean;
}

export default function AudioStateDisplay({ blend, audioLoaded, audioStarted }: Props) {
  const stateColors: Record<string, string> = {
    idle: "#4ade80",
    accelerating: "#f97316",
    decelerating: "#60a5fa",
  };

  return (
    <div className="panel">
      <h2>Engine State</h2>

      <div className="status-row">
        <span className="label">Audio Loaded</span>
        <span className={`badge ${audioLoaded ? "badge-ok" : "badge-warn"}`}>
          {audioLoaded ? "YES" : "NO"}
        </span>
      </div>
      <div className="status-row">
        <span className="label">Audio Playing</span>
        <span className={`badge ${audioStarted ? "badge-ok" : "badge-warn"}`}>
          {audioStarted ? "YES" : "NO"}
        </span>
      </div>

      <div
        className="engine-state-badge"
        style={{ backgroundColor: stateColors[blend.engineState] }}
      >
        {blend.engineState.toUpperCase()}
      </div>

      <h3>Audio Blend</h3>
      <div className="blend-bars">
        <div className="blend-row">
          <span className="label">Idle</span>
          <div className="blend-bar-bg">
            <div
              className="blend-bar"
              style={{
                width: `${blend.idleVolume * 100}%`,
                backgroundColor: "#4ade80",
              }}
            />
          </div>
          <span className="blend-pct">{(blend.idleVolume * 100).toFixed(0)}%</span>
        </div>
        <div className="blend-row">
          <span className="label">Accel</span>
          <div className="blend-bar-bg">
            <div
              className="blend-bar"
              style={{
                width: `${blend.accelVolume * 100}%`,
                backgroundColor: "#f97316",
              }}
            />
          </div>
          <span className="blend-pct">{(blend.accelVolume * 100).toFixed(0)}%</span>
        </div>
        <div className="blend-row">
          <span className="label">Decel</span>
          <div className="blend-bar-bg">
            <div
              className="blend-bar"
              style={{
                width: `${blend.decelVolume * 100}%`,
                backgroundColor: "#60a5fa",
              }}
            />
          </div>
          <span className="blend-pct">{(blend.decelVolume * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="data-row">
        <span className="label">Playback Rate</span>
        <span className="value">{blend.playbackRate.toFixed(2)}x</span>
      </div>
    </div>
  );
}
