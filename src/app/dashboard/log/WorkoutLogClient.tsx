"use client";

import { useState } from "react";
import Link from "next/link";

export default function WorkoutLogClient({ routines }: { routines: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0m 0s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!routines || routines.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
        <span className="text-4xl mb-4 block">📋</span>
        <h2 className="text-xl font-bold mb-2">Sin entrenamientos aún</h2>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Aún no has completado ninguna rutina. ¡Empieza hoy y registra tu progreso!
        </p>
        <Link
          href="/dashboard/routine/builder"
          className="inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition-colors"
        >
          Crear mi primera rutina
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-6">Historial de Entrenamientos</h1>

      {routines.map((routine) => {
        const isExpanded = expandedId === routine.id;

        // Extraer grupos musculares únicos de forma robusta
        const muscleGroups = Array.from(
          new Set(
            (routine.routine_exercises || [])
              .map((re: any) => {
                const mg = re.exercise?.muscle_group;
                return Array.isArray(mg) ? mg[0]?.name : mg?.name;
              })
              .filter(Boolean)
          )
        );

        return (
          <div
            key={routine.id}
            className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden transition-all hover:border-gray-700"
          >
            <div
              onClick={() => toggleExpand(routine.id)}
              className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <p className="text-sm text-blue-400 font-medium capitalize mb-1">
                  {formatDate(routine.completed_at)}
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  {muscleGroups.length > 0 ? (
                    muscleGroups.map((mg: any, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full text-xs bg-gray-800 text-gray-300 font-medium border border-gray-700"
                      >
                        {mg}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">Entrenamiento general</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 text-sm">
                <div className="text-right">
                  <span className="text-gray-400 block text-xs">Duración</span>
                  <span className="font-semibold text-white">
                    {formatDuration(routine.duration_seconds)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-xs">Ejercicios</span>
                  <span className="font-semibold text-white">
                    {(routine.routine_exercises || []).length}
                  </span>
                </div>
                <div className="text-gray-400">
                  {isExpanded ? "▲" : "▼"}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-800 bg-gray-950/50 p-6 space-y-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Detalle de ejercicios
                </h3>
                <div className="divide-y divide-gray-800/60">
                  {(routine.routine_exercises || []).map((re: any, index: number) => {
                    const ex = re.exercise;
                    const mg = Array.isArray(ex?.muscle_group) ? ex?.muscle_group[0] : ex?.muscle_group;
                    return (
                      <div key={re.id || index} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">
                            {ex?.name || "Ejercicio"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {mg?.name || ""}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <span className="text-gray-300 font-medium">
                            {re.sets_done} series × {re.reps_done} reps
                          </span>
                          {re.weight_used !== null && re.weight_used !== undefined && re.weight_used > 0 && (
                            <span className="block text-xs text-blue-400">
                              {re.weight_used} kg
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
