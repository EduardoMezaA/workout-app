"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export type ExerciseOption = {
  id: string;
  name: string;
};

export type ExerciseProgressionPoint = {
  date: string; // "14 Oct"
  fullDate: string; // "Lunes, 14 de octubre de 2026"
  weight: number; // kg
};

type StrengthChartProps = {
  exercises: ExerciseOption[];
  getProgressionForExercise: (exerciseId: string) => ExerciseProgressionPoint[];
};

export default function StrengthChart({
  exercises,
  getProgressionForExercise,
}: StrengthChartProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    exercises[0]?.id || ""
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return exercises;
    const q = searchQuery.toLowerCase();
    return exercises.filter((ex) => ex.name.toLowerCase().includes(q));
  }, [exercises, searchQuery]);

  // Si el ejercicio seleccionado no está o cambió
  const activeExerciseId =
    selectedExerciseId && exercises.some((e) => e.id === selectedExerciseId)
      ? selectedExerciseId
      : exercises[0]?.id || "";

  const chartData = useMemo(() => {
    if (!activeExerciseId) return [];
    return getProgressionForExercise(activeExerciseId);
  }, [activeExerciseId, getProgressionForExercise]);

  const activeExerciseName =
    exercises.find((e) => e.id === activeExerciseId)?.name || "Ejercicio";

  if (!exercises || exercises.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-800 rounded-xl bg-gray-950/40">
        <span className="text-3xl mb-2">🏋️</span>
        <p className="text-gray-400 text-sm font-medium">
          Sin historial de cargas en tus ejercicios
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Añade el peso utilizado durante tus entrenamientos para ver la progresión de tu fuerza aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector y buscador de ejercicios */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Buscar ejercicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex-1 sm:max-w-xs">
          <select
            value={activeExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {filteredExercises.map((ex) => (
              <option key={ex.id} value={ex.id} className="bg-gray-900 text-white">
                {ex.name}
              </option>
            ))}
            {filteredExercises.length === 0 && (
              <option disabled value="" className="bg-gray-900 text-gray-500">
                No hay coincidencias
              </option>
            )}
          </select>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-800 rounded-xl bg-gray-950/40">
          <p className="text-gray-400 text-sm font-medium">
            No hay registros de peso para {activeExerciseName} en este período.
          </p>
        </div>
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1f2937"
                vertical={false}
              />
              <XAxis
                dataKey="date"
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
                unit="kg"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as ExerciseProgressionPoint;
                    return (
                      <div className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-lg shadow-lg text-xs">
                        <p className="text-gray-400 font-medium mb-1">
                          {item.fullDate}
                        </p>
                        <p className="text-emerald-400 font-bold">
                          Máximo: {item.weight} kg
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
