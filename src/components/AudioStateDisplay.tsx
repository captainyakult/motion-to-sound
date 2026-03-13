"use client";

import type { VelocityAudioState } from "@/lib/mapping";

interface Props {
  audioState: VelocityAudioState;
  audioStarted: boolean;
}

export default function AudioStateDisplay({ audioState, audioStarted }: Props) {
  const stateColors: Record<string, string> = {
    idle: "#4ade80",
    accelerating: "#f97316",
    decelerating: "#60a5fa",
  };

  return (
    <div className="panel">
      <h2>Audio State</h2>

      <div className="status-row">
        <span className="label">Audio Playing</span>
        <span className={`badge ${audioStarted ? "badge-ok" : "badge-warn"}`}>
          {audioStarted ? "YES" : "NO"}
        </span>
      </div>

      <div
        className="engine-state-badge"
        style={{ backgroundColor: stateColors[audioState.engineState] }}
      >
        {audioState.engineState.toUpperCase()}
      </div>

      <div className="data-grid" style={{ marginTop: "0.75rem" }}>
        <div className="data-row highlight">
          <span className="label">Frequency</span>
          <span className="value">{audioState.frequency.toFixed(0)} Hz</span>
        </div>
        <div className="data-row">
          <span className="label">Range</span>
          <span className="value">50 – 1000 Hz</span>
        </div>
      </div>

      {/* Frequency bar */}
      <div className="bar-container" style={{ marginTop: "0.5rem" }}>
        <div
          className="bar-fill"
          style={{
            width: `${audioState.normalized * 100}%`,
            background: `linear-gradient(90deg, #4ade80, #f97316, #ef4444)`,
          }}
        />
      </div>
    </div>
  );
}
