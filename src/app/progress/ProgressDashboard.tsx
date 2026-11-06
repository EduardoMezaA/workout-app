"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import KPICard from "./components/KPICard";
import FrequencyChart, { FrequencyDataPoint } from "./components/FrequencyChart";
import VolumeChart, { VolumeDataPoint } from "./components/VolumeChart";
import StrengthChart, {
  ExerciseOption,
  ExerciseProgressionPoint,
} from "./components/StrengthChart";

export type DateRangeKey = "30d" | "3m" | "6m" | "1y" | "all";

type ExerciseInfo = {
  id: string;
  name: string;
};

type RoutineExerciseItem = {
  id: string;
  exercise_id: string;
  sets_done: number | null;
  reps_done: number | null;
  weight_used: number | null;
  exercise: ExerciseInfo | ExerciseInfo[] | null;
};

type RoutineItem = {
  id: string;
  completed_at: string | null;
  duration_seconds: number | null;
  routine_exercises: RoutineExerciseItem[] | null;
};

type RoutineDateItem = {
  id: string;
  completed_at: string | null;
};

type RoutineExerciseWithRoutine = {
  id: string;
  exercise_id: string;
  weight_used: number | null;
  routine: { completed_at: string | null } | { completed_at: string | null }[] | null;
  exercise: ExerciseInfo | ExerciseInfo[] | null;
};

const RANGE_OPTIONS: { id: DateRangeKey; label: string }[] = [
  { id: "30d", label: "Últimos 30 días" },
  { id: "3m", label: "Últimos 3 meses" },
  { id: "6m", label: "Últimos 6 meses" },
  { id: "1y", label: "Último año" },
  { id: "all", label: "Todo el historial" },
];

function getDateRange(key: DateRangeKey): { from: Date | null; to: Date } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);

  let from: Date | null = new Date();
  from.setHours(0, 0, 0, 0);

  if (key === "30d") {
    from.setDate(from.getDate() - 30);
  } else if (key === "3m") {
    from.setMonth(from.getMonth() - 3);
  } else if (key === "6m") {
    from.setMonth(from.getMonth() - 6);
  } else if (key === "1y") {
    from.setFullYear(from.getFullYear() - 1);
  } else {
    from = null;
  }

  return { from, to };
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getWeekKey(d: Date): string {
  const monday = getMonday(d);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const day = String(monday.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ProgressDashboard() {
  const [selectedRange, setSelectedRange] = useState<DateRangeKey>("30d");
  const [loading, setLoading] = useState(true);
  const [totalHistoricRoutinesCount, setTotalHistoricRoutinesCount] = useState<number | null>(null);

  // Datos del rango actual
  const [routines, setRoutines] = useState<RoutineItem[]>([]);

  // Historial global para racha y ejercicios con peso
  const [allRoutinesDates, setAllRoutinesDates] = useState<Date[]>([]);
  const [exercisesWithWeight, setExercisesWithWeight] = useState<ExerciseOption[]>([]);
  const [allRoutineExercisesWithWeight, setAllRoutineExercisesWithWeight] = useState<
    RoutineExerciseWithRoutine[]
  >([]);

  // 1. Carga inicial: historial completo para racha, check de empty state global y ejercicios
  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function fetchInitial() {
      try {
        const { data: allRoutines, error: rError } = await supabase
          .from("routines")
          .select("id, completed_at")
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false });

        if (!active) return;

        if (rError) {
          console.error("Error al cargar historial general:", rError);
        }

        const count = allRoutines ? allRoutines.length : 0;
        setTotalHistoricRoutinesCount(count);

        if (allRoutines && allRoutines.length > 0) {
          const typedRoutines = allRoutines as RoutineDateItem[];
          setAllRoutinesDates(
            typedRoutines
              .map((r) => (r.completed_at ? new Date(r.completed_at) : null))
              .filter((d): d is Date => d !== null)
          );

          const { data: reData, error: reError } = await supabase
            .from("routine_exercises")
            .select(
              `
              id,
              exercise_id,
              weight_used,
              routine:routines!inner (
                completed_at
              ),
              exercise:exercises (
                id,
                name
              )
            `
            )
            .not("weight_used", "is", null)
            .gt("weight_used", 0)
            .not("routine.completed_at", "is", null);

          if (!active) return;

          if (reError) {
            console.error("Error al cargar ejercicios con peso:", reError);
          } else if (reData) {
            const typedReData = reData as unknown as RoutineExerciseWithRoutine[];
            setAllRoutineExercisesWithWeight(typedReData);

            const exMap = new Map<string, string>();
            typedReData.forEach((item) => {
              const ex = Array.isArray(item.exercise) ? item.exercise[0] : item.exercise;
              if (ex?.id && ex?.name) {
                exMap.set(ex.id, ex.name);
              }
            });

            const uniqueExercises: ExerciseOption[] = Array.from(
              exMap.entries()
            ).map(([id, name]) => ({ id, name }));

            setExercisesWithWeight(uniqueExercises);
          }
        }
      } catch (err) {
        if (active) console.error("Error en fetchInitial:", err);
      }
    }

    void fetchInitial();

    return () => {
      active = false;
    };
  }, []);

  // 2. Carga por rango seleccionado
  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function fetchRange() {
      try {
        const { from, to } = getDateRange(selectedRange);

        let query = supabase
          .from("routines")
          .select(
            `
            id,
            completed_at,
            duration_seconds,
            routine_exercises (
              id,
              exercise_id,
              sets_done,
              reps_done,
              weight_used,
              exercise:exercises (
                id,
                name
              )
            )
          `
          )
          .not("completed_at", "is", null)
          .lte("completed_at", to.toISOString())
          .order("completed_at", { ascending: true });

        if (from) {
          query = query.gte("completed_at", from.toISOString());
        }

        const { data, error } = await query;

        if (!active) return;

        if (error) {
          console.error("Error cargando rutinas del rango:", error);
          setRoutines([]);
        } else {
          setRoutines((data as unknown as RoutineItem[]) || []);
        }
      } catch (err) {
        if (active) {
          console.error("Error al cargar rango:", err);
          setRoutines([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchRange();

    return () => {
      active = false;
    };
  }, [selectedRange]);

  // CÁLCULO DE KPIS
  const totalWorkouts = routines.length;

  const totalTimeFormatted = useMemo(() => {
    const totalSeconds = routines.reduce(
      (acc, r) => acc + (r.duration_seconds || 0),
      0
    );
    if (!totalSeconds) return "0min";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }, [routines]);

  const totalVolumeKg = useMemo(() => {
    let sum = 0;
    routines.forEach((r) => {
      (r.routine_exercises || []).forEach((re) => {
        if (re.weight_used && re.weight_used > 0) {
          const sets = re.sets_done || 0;
          const reps = re.reps_done || 0;
          sum += sets * reps * re.weight_used;
        }
      });
    });
    return sum;
  }, [routines]);

  // Cálculo de racha en semanas consecutivas sobre todo el historial
  const currentStreakWeeks = useMemo(() => {
    if (!allRoutinesDates || allRoutinesDates.length === 0) return 0;

    const weeksWithTraining = new Set<string>();
    allRoutinesDates.forEach((date) => {
      weeksWithTraining.add(getWeekKey(date));
    });

    const now = new Date();
    const currentWeekMonday = getMonday(now);
    const currentWeekKey = getWeekKey(now);

    let checkMonday = new Date(currentWeekMonday);
    let streak = 0;

    if (weeksWithTraining.has(currentWeekKey)) {
      while (weeksWithTraining.has(getWeekKey(checkMonday))) {
        streak++;
        checkMonday.setDate(checkMonday.getDate() - 7);
      }
    } else {
      const prevWeekMonday = new Date(currentWeekMonday);
      prevWeekMonday.setDate(prevWeekMonday.getDate() - 7);

      if (weeksWithTraining.has(getWeekKey(prevWeekMonday))) {
        checkMonday = prevWeekMonday;
        while (weeksWithTraining.has(getWeekKey(checkMonday))) {
          streak++;
          checkMonday.setDate(checkMonday.getDate() - 7);
        }
      } else {
        streak = 0;
      }
    }

    return streak;
  }, [allRoutinesDates]);

  // CÁLCULO DE GRÁFICA 1: Frecuencia semanal
  const frequencyData = useMemo<FrequencyDataPoint[]>(() => {
    if (routines.length === 0) return [];

    const { from, to } = getDateRange(selectedRange);

    let startMonday: Date;
    if (from) {
      startMonday = getMonday(from);
    } else {
      const firstDate = routines[0]?.completed_at
        ? new Date(routines[0].completed_at)
        : new Date();
      startMonday = getMonday(firstDate);
    }

    const endMonday = getMonday(to);

    const countByWeek = new Map<string, number>();
    routines.forEach((r) => {
      if (r.completed_at) {
        const key = getWeekKey(new Date(r.completed_at));
        countByWeek.set(key, (countByWeek.get(key) || 0) + 1);
      }
    });

    const result: FrequencyDataPoint[] = [];
    const curr = new Date(startMonday);

    while (curr <= endMonday) {
      const key = getWeekKey(curr);
      const label = curr.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });
      const fullLabel = `Semana del ${curr.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
      })}`;

      result.push({
        week: label,
        fullLabel,
        sessions: countByWeek.get(key) || 0,
      });

      curr.setDate(curr.getDate() + 7);
    }

    return result;
  }, [routines, selectedRange]);

  // CÁLCULO DE GRÁFICA 2: Volumen semanal
  const volumeData = useMemo<VolumeDataPoint[]>(() => {
    if (routines.length === 0) return [];

    const { from, to } = getDateRange(selectedRange);

    let startMonday: Date;
    if (from) {
      startMonday = getMonday(from);
    } else {
      const firstDate = routines[0]?.completed_at
        ? new Date(routines[0].completed_at)
        : new Date();
      startMonday = getMonday(firstDate);
    }

    const endMonday = getMonday(to);

    const volByWeek = new Map<string, number>();
    routines.forEach((r) => {
      if (r.completed_at) {
        const key = getWeekKey(new Date(r.completed_at));
        let sum = 0;
        (r.routine_exercises || []).forEach((re) => {
          if (re.weight_used && re.weight_used > 0) {
            sum += (re.sets_done || 0) * (re.reps_done || 0) * re.weight_used;
          }
        });
        volByWeek.set(key, (volByWeek.get(key) || 0) + sum);
      }
    });

    const result: VolumeDataPoint[] = [];
    const curr = new Date(startMonday);

    while (curr <= endMonday) {
      const key = getWeekKey(curr);
      const label = curr.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });
      const fullLabel = `Semana del ${curr.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
      })}`;

      result.push({
        week: label,
        fullLabel,
        volume: volByWeek.get(key) || 0,
      });

      curr.setDate(curr.getDate() + 7);
    }

    return result;
  }, [routines, selectedRange]);

  // FUNCIÓN PARA GRÁFICA 3: Progresión por ejercicio en el rango actual
  const getProgressionForExercise = useMemo(() => {
    return (exerciseId: string): ExerciseProgressionPoint[] => {
      const { from, to } = getDateRange(selectedRange);

      const filtered = allRoutineExercisesWithWeight.filter((item) => {
        if (item.exercise_id !== exerciseId) return false;
        const routineObj = Array.isArray(item.routine) ? item.routine[0] : item.routine;
        const cDate = routineObj?.completed_at ? new Date(routineObj.completed_at) : null;
        if (!cDate) return false;
        if (from && cDate < from) return false;
        if (cDate > to) return false;
        return true;
      });

      const maxBySession = new Map<string, { dateObj: Date; maxWeight: number }>();

      filtered.forEach((item) => {
        const routineObj = Array.isArray(item.routine) ? item.routine[0] : item.routine;
        if (!routineObj?.completed_at) return;
        const d = new Date(routineObj.completed_at);
        const sessionKey = d.toISOString();
        const weight = item.weight_used || 0;

        const current = maxBySession.get(sessionKey);
        if (!current || weight > current.maxWeight) {
          maxBySession.set(sessionKey, { dateObj: d, maxWeight: weight });
        }
      });

      const sortedSessions = Array.from(maxBySession.values()).sort(
        (a, b) => a.dateObj.getTime() - b.dateObj.getTime()
      );

      return sortedSessions.map((s) => ({
        date: s.dateObj.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        }),
        fullDate: s.dateObj.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        weight: s.maxWeight,
      }));
    };
  }, [allRoutineExercisesWithWeight, selectedRange]);

  // Empty state global: si el usuario no tiene ninguna rutina completada en la app
  if (totalHistoricRoutinesCount === 0 && !loading) {
    return (
      <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800 p-8">
        <span className="text-4xl mb-4 block">📈</span>
        <h2 className="text-xl font-bold mb-2 text-white">Sin datos de progreso aún</h2>
        <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
          Aún no has completado ninguna rutina. Entrena por primera vez para comenzar a visualizar tus estadísticas de progreso y fuerza.
        </p>
        <Link
          href="/dashboard/routine/builder"
          className="inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-colors text-sm"
        >
          Crear mi primera rutina
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Selector de Rango de Fechas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Tu Progreso</h1>
          <p className="text-xs text-gray-400 mt-1">
            Visualiza tu constancia, volumen de carga y evolución de fuerza.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 bg-gray-900 border border-gray-800 rounded-xl">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setLoading(true);
                setSelectedRange(opt.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedRange === opt.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Entrenamientos"
          value={loading ? "..." : totalWorkouts}
          subtitle="Completados en el período"
          icon="🔥"
        />
        <KPICard
          title="Tiempo Total"
          value={loading ? "..." : totalTimeFormatted}
          subtitle="Horas y minutos activos"
          icon="⏱️"
        />
        <KPICard
          title="Volumen Total"
          value={
            loading
              ? "..."
              : totalVolumeKg > 0
              ? `${totalVolumeKg.toLocaleString("es-ES")} kg`
              : "0 kg"
          }
          subtitle="Sets × Reps × Peso"
          icon="⚡"
        />
        <KPICard
          title="Racha Actual"
          value={
            loading
              ? "..."
              : currentStreakWeeks > 0
              ? `${currentStreakWeeks} sem.`
              : "0 sem."
          }
          subtitle="Semanas consecutivas"
          icon="🏆"
        />
      </div>

      {/* Gráficas Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica 1: Frecuencia Semanal */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">
              Frecuencia de Entrenamiento
            </h2>
            <p className="text-xs text-gray-400">
              Sesiones completadas por semana
            </p>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
              Cargando estadísticas...
            </div>
          ) : (
            <FrequencyChart data={frequencyData} />
          )}
        </div>

        {/* Gráfica 2: Evolución de Volumen */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">
              Evolución del Volumen
            </h2>
            <p className="text-xs text-gray-400">
              Kilogramos totales acumulados por semana
            </p>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
              Cargando estadísticas...
            </div>
          ) : (
            <VolumeChart data={volumeData} />
          )}
        </div>
      </div>

      {/* Gráfica 3: Progresión de Fuerza por Ejercicio */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="mb-4">
          <h2 className="text-base font-bold text-white">
            Progresión de Fuerza
          </h2>
          <p className="text-xs text-gray-400">
            Carga máxima registrada por sesión en un ejercicio específico
          </p>
        </div>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
            Cargando ejercicios...
          </div>
        ) : (
          <StrengthChart
            exercises={exercisesWithWeight}
            getProgressionForExercise={getProgressionForExercise}
          />
        )}
      </div>
    </div>
  );
}
