"use client";

import type { VelocityData } from "@/lib/velocity";
import { MAX_SPEED } from "@/lib/velocity";

interface Props {
  data: VelocityData;
}

export default function MotionDisplay({ data }: Props) {
  return (
    <div className="panel">
      <h2>Velocity Data</h2>
      <div className="data-grid">
        <div className="data-row">
          <span className="label">Source</span>
          <span className="value">{data.source.toUpperCase()}</span>
        </div>
        <div className="data-row">
          <span className="label">Raw Speed</span>
          <span className="value">{data.speed.toFixed(2)} m/s</span>
        </div>
        <div className="data-row highlight">
          <span className="label">Smoothed Speed</span>
          <span className="value">{data.smoothedSpeed.toFixed(2)} m/s</span>
        </div>
        <div className="data-row highlight">
          <span className="label">Normalized</span>
          <span className="value">{data.normalized.toFixed(3)}</span>
        </div>
        {data.accuracy !== null && (
          <div className="data-row">
            <span className="label">GPS Accuracy</span>
            <span className="value">±{data.accuracy.toFixed(0)} m</span>
          </div>
        )}
        <div className="data-row">
          <span className="label">Max Speed</span>
          <span className="value">{MAX_SPEED} m/s</span>
        </div>
      </div>
      <div className="bar-container">
        <div
          className="bar-fill"
          style={{ width: `${data.normalized * 100}%` }}
        />
      </div>
    </div>
  );
}
