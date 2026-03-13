"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  time: number;
  magnitude: number;
  normalized: number;
}

interface Props {
  history: DataPoint[];
}

export default function AccelerationGraph({ history }: Props) {
  return (
    <div className="panel">
      <h2>Acceleration Graph</h2>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="time"
              tick={false}
              stroke="#666"
            />
            <YAxis domain={[0, 1]} stroke="#666" />
            <Line
              type="monotone"
              dataKey="normalized"
              stroke="#f97316"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="magnitude"
              stroke="#60a5fa"
              dot={false}
              strokeWidth={1}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="graph-legend">
        <span style={{ color: "#f97316" }}>■ Normalized</span>
        <span style={{ color: "#60a5fa" }}>■ Magnitude (scaled)</span>
      </div>
    </div>
  );
}
