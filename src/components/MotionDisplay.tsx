"use client";

import type { MotionData } from "@/lib/motion";

interface Props {
  data: MotionData;
}

export default function MotionDisplay({ data }: Props) {
  return (
    <div className="panel">
      <h2>Acceleration Data</h2>
      <div className="data-grid">
        <div className="data-row">
          <span className="label">X</span>
          <span className="value">{data.x.toFixed(3)}</span>
        </div>
        <div className="data-row">
          <span className="label">Y</span>
          <span className="value">{data.y.toFixed(3)}</span>
        </div>
        <div className="data-row">
          <span className="label">Z</span>
          <span className="value">{data.z.toFixed(3)}</span>
        </div>
        <div className="data-row highlight">
          <span className="label">Magnitude</span>
          <span className="value">{data.magnitude.toFixed(3)}</span>
        </div>
        <div className="data-row highlight">
          <span className="label">Normalized</span>
          <span className="value">{data.normalized.toFixed(3)}</span>
        </div>
      </div>
      {/* Visual bar for normalized acceleration */}
      <div className="bar-container">
        <div
          className="bar-fill"
          style={{ width: `${data.normalized * 100}%` }}
        />
      </div>
    </div>
  );
}
