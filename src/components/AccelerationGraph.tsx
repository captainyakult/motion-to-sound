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
  speed: number;
  frequency: number;
}

interface Props {
  history: DataPoint[];
}

export default function AccelerationGraph({ history }: Props) {
  return (
    <div className="panel">
      <h2>Speed / Frequency Graph</h2>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="time" tick={false} stroke="#666" />
            <YAxis domain={[0, 1]} stroke="#666" />
            <Line
              type="monotone"
              dataKey="speed"
              stroke="#4ade80"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="frequency"
              stroke="#f97316"
              dot={false}
              strokeWidth={1}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="graph-legend">
        <span style={{ color: "#4ade80" }}>■ Speed (norm.)</span>
        <span style={{ color: "#f97316" }}>■ Frequency (norm.)</span>
      </div>
    </div>
  );
}
