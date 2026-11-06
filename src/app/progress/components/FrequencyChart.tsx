"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export type FrequencyDataPoint = {
  week: string; // ej. "14 Oct"
  fullLabel?: string; // ej. "Semana del 14 de Octubre"
  sessions: number;
};

type FrequencyChartProps = {
  data: FrequencyDataPoint[];
};

export default function FrequencyChart({ data }: FrequencyChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.sessions === 0)) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-800 rounded-xl bg-gray-950/40">
        <span className="text-3xl mb-2">📊</span>
        <p className="text-gray-400 text-sm font-medium">
          Sin entrenamientos registrados en este período
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Completa rutinas para ver tu frecuencia semanal aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
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
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as FrequencyDataPoint;
                return (
                  <div className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-lg shadow-lg text-xs">
                    <p className="text-gray-400 font-medium mb-1">
                      {item.fullLabel || item.week}
                    </p>
                    <p className="text-blue-400 font-bold">
                      {item.sessions} {item.sessions === 1 ? "sesión" : "sesiones"}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="sessions"
            fill="#3b82f6"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
