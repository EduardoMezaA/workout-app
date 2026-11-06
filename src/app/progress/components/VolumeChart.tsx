"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export type VolumeDataPoint = {
  week: string;
  fullLabel?: string;
  volume: number; // kg
};

type VolumeChartProps = {
  data: VolumeDataPoint[];
};

export default function VolumeChart({ data }: VolumeChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.volume === 0)) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-800 rounded-xl bg-gray-950/40">
        <span className="text-3xl mb-2">⚖️</span>
        <p className="text-gray-400 text-sm font-medium">
          Sin volumen de peso registrado en este período
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Registra el peso de tus ejercicios al entrenar para ver tu curva de volumen.
        </p>
      </div>
    );
  }

  const formatKg = (val: number) => {
    if (val >= 1000) return `${(val / 1000).toFixed(1)}t`;
    return `${val}kg`;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1f2937"
            vertical={false}
          />
          <XAxis
            dataKey="week"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#374151" }}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#374151" }}
            tickFormatter={formatKg}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as VolumeDataPoint;
                return (
                  <div className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-lg shadow-lg text-xs">
                    <p className="text-gray-400 font-medium mb-1">
                      {item.fullLabel || item.week}
                    </p>
                    <p className="text-purple-400 font-bold">
                      {item.volume.toLocaleString("es-ES")} kg acumulados
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#8b5cf6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#volumeGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
