"use client";

import { useState, useMemo, useRef } from "react";
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
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Si el ejercicio seleccionado no está o cambió
  const activeExerciseId =
    selectedExerciseId && exercises.some((e) => e.id === selectedExerciseId)
      ? selectedExerciseId
      : exercises[0]?.id || "";

  // Normaliza quitando acentos y mayúsculas para comparar
  const normalize = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const suggestions = useMemo(() => {
    const q = normalize(query);
    if (!q) return exercises;
    return exercises.filter((ex) => normalize(ex.name).includes(q));
  }, [exercises, query]);

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
      {/* Campo con autocompletado de ejercicios */}
      <div className="relative max-w-sm">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-controls="exercise-listbox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          placeholder="Buscar ejercicio..."
          value={isOpen ? query : activeExerciseName}
          onFocus={() => {
            setQuery("");
            setIsOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onBlur={() => {
            setIsOpen(false);
            setQuery("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
              setQuery("");
              e.currentTarget.blur();
            }
          }}
          className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-3 pr-10 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />

        {(isOpen ? query : activeExerciseName).length > 0 && (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            // onMouseDown evita que el input pierda foco antes del clic
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQuery("");
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}

        {isOpen && (
          <ul
            id="exercise-listbox"
            role="listbox"
            className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-lg py-1"
          >
            {suggestions.length === 0 ? (
              <li className="px-3 py-2 text-xs text-gray-500">
                No hay coincidencias
              </li>
            ) : (
              suggestions.map((ex) => (
                <li
                  key={ex.id}
                  role="option"
                  aria-selected={ex.id === activeExerciseId}
                  // onMouseDown evita que el input pierda foco antes de registrar el clic
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSelectedExerciseId(ex.id);
                    setQuery("");
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-800 ${
                    ex.id === activeExerciseId ? "text-blue-400" : "text-white"
                  }`}
                >
                  {ex.name}
                </li>
              ))
            )}
          </ul>
        )}
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
