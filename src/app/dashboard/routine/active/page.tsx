"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Exercise = {
  id: string;
  name: string;
  description: string | null;
  sets_recommended: number;
  reps_recommended: number;
  rest_seconds: number;
  image_url: string | null;
  gif_url: string | null;
  muscle_group: { slug: string } | null;
};

type RoutineExercise = {
  id: string;
  routine_id: string;
  exercise_id: string;
  order_index: number;
  sets_done: number;
  reps_done: number;
  weight_used: number | null;
  exercise: Exercise;
};

type Phase = "warmup" | "exercise" | "rest" | "stretching" | "finished";

type TimedExercise = { text: string; seconds: number };

const WARMUP_BY_GROUP: Record<string, TimedExercise[]> = {
  pecho: [
    { text: "Rotación de hombros hacia adelante", seconds: 30 },
    { text: "Aperturas de brazos en cruz 20 reps", seconds: 40 },
    { text: "Flexiones lentas sin peso 10 reps", seconds: 40 },
  ],
  espalda: [
    { text: "Rotación de hombros hacia atrás", seconds: 30 },
    { text: "Gato-vaca en el suelo 10 reps", seconds: 40 },
    { text: "Jalones al frente sin peso 15 reps", seconds: 40 },
  ],
  hombros: [
    { text: "Rotación completa de hombros", seconds: 30 },
    { text: "Círculos de brazos pequeños y grandes 20 reps", seconds: 40 },
    { text: "Press de hombros sin peso 15 reps", seconds: 40 },
  ],
  brazos: [
    { text: "Rotación de muñecas", seconds: 30 },
    { text: "Flexiones de codo sin peso 15 reps", seconds: 40 },
    { text: "Extensiones de tríceps sin peso 15 reps", seconds: 40 },
  ],
  piernas: [
    { text: "Trote en el lugar", seconds: 60 },
    { text: "Sentadillas sin peso 15 reps", seconds: 40 },
    { text: "Estocadas en el lugar 10 reps cada pierna", seconds: 40 },
  ],
  core: [
    { text: "Respiración diafragmática", seconds: 30 },
    { text: "Plancha", seconds: 20 },
    { text: "Rodillas al pecho acostado 10 reps", seconds: 40 },
  ],
};

const STRETCHING_BY_GROUP: Record<string, TimedExercise[]> = {
  pecho: [
    { text: "Estiramiento de pecho en pared cada lado", seconds: 30 },
    { text: "Apertura de brazos acostado", seconds: 30 },
    { text: "Estiramiento de hombro cruzado cada lado", seconds: 30 },
  ],
  espalda: [
    { text: "Postura del niño", seconds: 40 },
    { text: "Estiramiento de espalda baja en el suelo", seconds: 30 },
    { text: "Torsión espinal sentado cada lado", seconds: 30 },
  ],
  hombros: [
    { text: "Estiramiento de hombro cruzado cada lado", seconds: 30 },
    { text: "Estiramiento de trapecios laterales cada lado", seconds: 30 },
    { text: "Postura del águila con brazos", seconds: 30 },
  ],
  brazos: [
    { text: "Estiramiento de bíceps contra pared cada brazo", seconds: 30 },
    { text: "Estiramiento de tríceps sobre cabeza cada brazo", seconds: 30 },
    { text: "Estiramiento de antebrazo cada lado", seconds: 30 },
  ],
  piernas: [
    { text: "Estiramiento de cuádriceps de pie cada pierna", seconds: 30 },
    { text: "Estiramiento de isquiotibiales sentado", seconds: 40 },
    {
      text: "Estiramiento de pantorrilla contra pared cada pierna",
      seconds: 30,
    },
  ],
  core: [
    { text: "Cobra en el suelo", seconds: 30 },
    { text: "Estiramiento lateral de pie cada lado", seconds: 30 },
    { text: "Postura del niño", seconds: 40 },
  ],
};

const DEFAULT_WARMUP: TimedExercise[] = [
  { text: "Trote en el lugar", seconds: 60 },
  { text: "Rotación de hombros", seconds: 30 },
  { text: "Círculos de cadera", seconds: 30 },
];

const DEFAULT_STRETCHING: TimedExercise[] = [
  { text: "Estiramiento de cuádriceps cada pierna", seconds: 30 },
  { text: "Estiramiento de isquiotibiales sentado", seconds: 40 },
  { text: "Estiramiento de pecho en pared", seconds: 30 },
];

function ActiveRoutineContent() {
  const searchParams = useSearchParams();
  const routineId = searchParams.get("id");
  const router = useRouter();
  const supabase = createClient();

  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  // Estado de la rutina
  const [phase, setPhase] = useState<Phase>("warmup");
  const [warmupIndex, setWarmupIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [stretchIndex, setStretchIndex] = useState(0);
  const [warmupList, setWarmupList] = useState<TimedExercise[]>([]);
  const [stretchingList, setStretchingList] = useState<TimedExercise[]>([]);

  // Timer
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalRef = useRef<NodeJS.Timeout | null>(null);
  const warmupListRef = useRef<TimedExercise[]>([]);
  const stretchingListRef = useRef<TimedExercise[]>([]);
  const timerEndCalledRef = useRef(false);
  const confettiRef = useRef<any>(null);

  // Peso (opcional)
  const [weights, setWeights] = useState<Record<string, number>>({});

  //Animaciones
  const [showIntro, setShowIntro] = useState(true);
  const [introStep, setIntroStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!routineId) return;
    supabase
      .from("routine_exercises")
      .select("*, exercise:exercises(*, muscle_group:muscle_groups(slug))")
      .eq("routine_id", routineId)
      .order("order_index")
      .then(({ data }) => {
        const exercises = (data as any) || [];
        setRoutineExercises(exercises);
        // Obtener slugs únicos de grupos musculares
        const slugs = [
          ...new Set(
            exercises
              .map((re: any) => re.exercise?.muscle_group?.slug)
              .filter(
                (s: any): s is string => typeof s === "string" && s.length > 0,
              ),
          ),
        ];

        // Combinar warmup y stretching de los grupos trabajados
        const warmup = new Map<string, TimedExercise>();
        const stretching = new Map<string, TimedExercise>();

        for (const slug of slugs as string[]) {
          const w = WARMUP_BY_GROUP[slug] || [];
          const s = STRETCHING_BY_GROUP[slug] || [];
          w.forEach((e) => warmup.set(e.text, e));
          s.forEach((e) => stretching.set(e.text, e));
        }

        setWarmupList(warmup.size > 0 ? [...warmup.values()] : DEFAULT_WARMUP);
        setStretchingList(
          stretching.size > 0 ? [...stretching.values()] : DEFAULT_STRETCHING,
        );
        setLoading(false);
      });
  }, [routineId]);

  // Timer principal
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isPaused || phase === "finished" || seconds <= 0) return;

    timerEndCalledRef.current = false;

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          if (!timerEndCalledRef.current) {
            timerEndCalledRef.current = true;
            setTimeout(() => handleTimerEnd(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
      setTotalElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [seconds, isPaused, phase]);

  // Intro animada
  useEffect(() => {
    if (!showIntro) return;

    const steps = [0, 1, 2, 3];
    const timers: NodeJS.Timeout[] = [];

    steps.forEach((step, i) => {
      timers.push(
        setTimeout(() => {
          setIntroStep(step);
          if (step > 0) {
            playBeep(step === 3 ? 1047 : 660, 0.15, 0.4);
          }
        }, i * 800),
      );
    });

    timers.push(setTimeout(() => setShowIntro(false), 3200));

    return () => timers.forEach((t) => clearTimeout(t));
  }, [showIntro]);

  // Confeti al terminar
  useEffect(() => {
    if (phase !== "finished") return;

    import("canvas-confetti").then(({ default: confetti }) => {
      setShowConfetti(true);
      confettiRef.current = confetti;

      const shoot = () => {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"],
        });
      };

      shoot();
      setTimeout(shoot, 400);
      setTimeout(shoot, 800);
    });
  }, [phase]);

  useEffect(() => {
    if (phase !== "exercise") return;
    if (isPaused) return;

    const interval = setInterval(() => {
      setTotalElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, isPaused]);

  useEffect(() => {
    if (warmupList.length > 0 && phase === "warmup") {
      setSeconds(warmupList[0]?.seconds || 30);
    }
  }, [warmupList]);

  useEffect(() => {
    warmupListRef.current = warmupList;
  }, [warmupList]);

  useEffect(() => {
    stretchingListRef.current = stretchingList;
  }, [stretchingList]);

  const playBeep = (frequency: number, duration: number, volume = 0.3) => {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration,
    );

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const playTimerEnd = () => {
    // Tres beeps cortos
    playBeep(880, 0.15);
    setTimeout(() => playBeep(880, 0.15), 200);
    setTimeout(() => playBeep(880, 0.15), 400);
  };

  const playRoutineEnd = () => {
    // Melodía de victoria
    playBeep(523, 0.2); // Do
    setTimeout(() => playBeep(659, 0.2), 200); // Mi
    setTimeout(() => playBeep(784, 0.2), 400); // Sol
    setTimeout(() => playBeep(1047, 0.4), 600); // Do alto
  };

  // Timer total

  const handleTimerEnd = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    playTimerEnd();
    if (phase === "warmup") {
      setWarmupIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex < warmupListRef.current.length) {
          setSeconds(warmupListRef.current[nextIndex]?.seconds || 30);
          return nextIndex;
        } else {
          setPhase("exercise");
          setSeconds(0);
          return prev;
        }
      });
      return;
    }

    if (phase === "rest") {
      setPhase("exercise");
      setSeconds(0);
      return;
    }

    if (phase === "stretching") {
      setStretchIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex < stretchingListRef.current.length) {
          setSeconds(stretchingListRef.current[nextIndex]?.seconds || 30);
          return nextIndex;
        } else {
          finishRoutine();
          return prev;
        }
      });
    }
  }, [phase]);

  const completeSet = () => {
    const ex = routineExercises[currentExerciseIndex];
    if (!ex) return;

    if (currentSet < ex.sets_done) {
      setCurrentSet((prev) => prev + 1);
      setPhase("rest");
      setSeconds(ex.exercise.rest_seconds);
    } else {
      // Terminó todas las series de este ejercicio
      const nextIndex = currentExerciseIndex + 1;
      if (nextIndex < routineExercises.length) {
        setCurrentExerciseIndex(nextIndex);
        setCurrentSet(1);
        setPhase("rest");
        setSeconds(routineExercises[nextIndex].exercise.rest_seconds);
      } else {
        setPhase("stretching");
        setSeconds(40);
        setStretchIndex(0);
      }
    }
  };

  const skipRest = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("exercise");
    setSeconds(0);
  };

  const finishRoutine = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (totalRef.current) clearInterval(totalRef.current);
    playRoutineEnd();
    setPhase("finished");

    await supabase
      .from("routines")
      .update({
        completed_at: new Date().toISOString(),
        duration_seconds: totalElapsed,
      })
      .eq("id", routineId);

    // Guardar pesos si se ingresaron
    for (const [exerciseId, weight] of Object.entries(weights)) {
      const re = routineExercises.find((r) => r.exercise_id === exerciseId);
      if (re) {
        await supabase
          .from("routine_exercises")
          .update({ weight_used: weight })
          .eq("id", re.id);
      }
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Cargando rutina...</p>
      </div>
    );
  }

  const currentEx = routineExercises[currentExerciseIndex];

  // Pantalla de intro
  if (showIntro) {
    const introMessages = [
      { text: "¿Listo?", color: "text-white", size: "text-7xl" },
      { text: "3", color: "text-yellow-400", size: "text-9xl" },
      { text: "2", color: "text-orange-400", size: "text-9xl" },
      { text: "1", color: "text-red-400", size: "text-9xl" },
    ];

    const current = introMessages[introStep];

    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
        <div className="text-center">
          <div
            key={introStep}
            className={`font-black ${current.size} ${current.color} transition-all duration-300`}
            style={{
              animation: "popIn 0.3s ease-out",
            }}
          >
            {current.text}
          </div>
          {introStep === 0 && (
            <p className="text-gray-400 mt-4 text-lg animate-pulse">
              Tu rutina está por comenzar
            </p>
          )}
          {introStep > 0 && (
            <p className="text-gray-500 mt-6 text-base">
              {routineExercises.length} ejercicios ·{" "}
              {
                [
                  ...new Set(
                    routineExercises.map(
                      (re) => re.exercise.muscle_group?.slug,
                    ),
                  ),
                ].filter(Boolean).length
              }{" "}
              grupos musculares
            </p>
          )}
        </div>
        <style>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      </div>
    );
  }

  // Pantalla finalizada
  if (phase === "finished") {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div
          className="text-center"
          style={{ animation: "popIn 0.5s ease-out" }}
        >
          <div className="text-8xl mb-6">🏆</div>
          <h1 className="text-4xl font-black mb-3">¡Rutina completada!</h1>
          <p className="text-gray-400 text-lg mb-1">Tiempo total</p>
          <p className="text-5xl font-bold text-blue-400 mb-6">
            {formatTime(totalElapsed)}
          </p>
          <div className="flex gap-6 justify-center mb-10 text-center">
            <div className="bg-gray-900 rounded-2xl px-6 py-4">
              <p className="text-2xl font-bold">{routineExercises.length}</p>
              <p className="text-xs text-gray-400 mt-1">Ejercicios</p>
            </div>
            <div className="bg-gray-900 rounded-2xl px-6 py-4">
              <p className="text-2xl font-bold">
                {routineExercises.reduce((sum, re) => sum + re.sets_done, 0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Series totales</p>
            </div>
            <div className="bg-gray-900 rounded-2xl px-6 py-4">
              <p className="text-2xl font-bold">
                {Object.keys(weights).length > 0
                  ? `${Math.max(...Object.values(weights))}kg`
                  : "—"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Peso máx</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-lg transition-colors"
          >
            Volver al inicio
          </button>
        </div>
        <style>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          ✕ Terminar
        </button>
        <span className="text-gray-400 text-sm">
          {formatTime(totalElapsed)}
        </span>
        <button
          onClick={() => setIsPaused((p) => !p)}
          className="text-sm px-4 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors"
        >
          {isPaused ? "▶ Continuar" : "⏸ Pausar"}
        </button>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-6 py-4 flex flex-col overflow-y-auto">
        {/* CALENTAMIENTO */}
        {phase === "warmup" && (
          <div className="flex flex-col flex-1">
            <div className="mb-2">
              <span className="text-xs font-medium text-yellow-400 uppercase tracking-wider">
                Calentamiento {warmupIndex + 1}/{warmupList.length}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-8">
              {warmupList[warmupIndex]?.text}
            </h2>
            <div className="flex-1 flex flex-col items-center justify-center">
              {seconds > 0 ? (
                <div className="text-8xl font-bold tabular-nums text-yellow-400">
                  {formatTime(seconds)}
                </div>
              ) : (
                <p className="text-gray-400">Cuando estés listo, comienza</p>
              )}
            </div>
            <div className="flex gap-3 mt-auto">
              <button
                onClick={() => {
                  if (intervalRef.current) clearInterval(intervalRef.current);
                  if (warmupIndex < warmupList.length - 1) {
                    const nextIndex = warmupIndex + 1;
                    setWarmupIndex(nextIndex);
                    setSeconds(warmupList[nextIndex]?.seconds || 30);
                  } else {
                    setPhase("exercise");
                    setSeconds(0);
                  }
                }}
                className="flex-1 py-4 rounded-2xl bg-gray-800 hover:bg-gray-700 font-semibold transition-colors"
              >
                {warmupIndex < warmupList.length - 1
                  ? "Siguiente →"
                  : "Empezar rutina →"}
              </button>
            </div>
          </div>
        )}

        {/* EJERCICIO */}
        {phase === "exercise" && currentEx && (
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
                Ejercicio {currentExerciseIndex + 1}/{routineExercises.length}
              </span>
              <span className="text-xs text-gray-400">
                Serie {currentSet}/{currentEx.sets_done}
              </span>
            </div>

            <h2 className="text-2xl font-bold mb-2">
              {currentEx.exercise.name}
            </h2>

            {currentEx.exercise.description && (
              <p className="text-gray-400 text-sm mb-4">
                {currentEx.exercise.description}
              </p>
            )}

            {/* GIF o imagen */}
            {(currentEx.exercise.gif_url || currentEx.exercise.image_url) && (
              <div className="w-full mb-4 flex items-center justify-center">
                <img
                  src={
                    currentEx.exercise.gif_url || currentEx.exercise.image_url!
                  }
                  alt={currentEx.exercise.name}
                  className="w-full max-w-sm aspect-square object-contain rounded-xl bg-gray-900"
                />
              </div>
            )}

            {/* Stopwatch */}
            <div className="flex flex-col items-center py-4 mb-4">
              <div className="text-6xl font-bold tabular-nums text-white">
                {formatTime(totalElapsed)}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tiempo total de rutina
              </p>
              {isPaused && (
                <span className="mt-2 text-xs text-yellow-400 font-medium uppercase tracking-wider">
                  ⏸ En pausa
                </span>
              )}
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1 p-3 rounded-xl bg-gray-900 text-center">
                <p className="text-2xl font-bold">{currentEx.reps_done}</p>
                <p className="text-xs text-gray-400 mt-1">Reps</p>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-gray-900 text-center">
                <p className="text-2xl font-bold">
                  {currentEx.exercise.rest_seconds}s
                </p>
                <p className="text-xs text-gray-400 mt-1">Descanso</p>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-gray-900">
                <input
                  type="number"
                  placeholder="0"
                  value={weights[currentEx.exercise_id] || ""}
                  onChange={(e) =>
                    setWeights((prev) => ({
                      ...prev,
                      [currentEx.exercise_id]: +e.target.value,
                    }))
                  }
                  className="w-full bg-transparent text-2xl font-bold text-center focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-center">
                  Kg (opcional)
                </p>
              </div>
            </div>

            {/* Pausa y completar */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={() => setIsPaused((p) => !p)}
                className="px-6 py-4 rounded-2xl border border-gray-700 hover:border-gray-500 transition-colors font-medium"
              >
                {isPaused ? "▶" : "⏸"}
              </button>

              <button
                onClick={completeSet}
                disabled={isPaused}
                className="mt-auto w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-lg transition-colors"
              >
                {currentSet < currentEx.sets_done
                  ? `Serie ${currentSet} completada ✓`
                  : "Ejercicio completado ✓"}
              </button>
            </div>
          </div>
        )}

        {/* DESCANSO */}
        {phase === "rest" && (
          <div className="flex flex-col flex-1 items-center justify-center">
            <span className="text-xs font-medium text-green-400 uppercase tracking-wider mb-4">
              Descanso
            </span>
            <div className="text-8xl font-bold tabular-nums text-green-400 mb-4">
              {formatTime(seconds)}
            </div>
            {currentEx && (
              <p className="text-gray-400 text-sm mb-10">
                Siguiente: {currentEx.exercise.name} — Serie {currentSet}/
                {currentEx.sets_done}
              </p>
            )}
            <button
              onClick={skipRest}
              className="px-8 py-3 rounded-2xl border border-gray-700 hover:border-gray-500 transition-colors text-sm"
            >
              Saltar descanso →
            </button>
          </div>
        )}

        {/* ESTIRAMIENTOS */}
        {phase === "stretching" && (
          <div className="flex flex-col flex-1">
            <div className="mb-2">
              <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">
                Estiramientos {stretchIndex + 1}/{stretchingList.length}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-8">
              {stretchingList[stretchIndex]?.text}
            </h2>
            <div className="flex-1 flex flex-col items-center justify-center">
              {seconds > 0 ? (
                <div className="text-8xl font-bold tabular-nums text-purple-400">
                  {formatTime(seconds)}
                </div>
              ) : (
                <p className="text-gray-400">Cuando estés listo, comienza</p>
              )}
            </div>
            <div className="flex gap-3 mt-auto">
              <button
                onClick={() => {
                  if (intervalRef.current) clearInterval(intervalRef.current);
                  if (stretchIndex < stretchingList.length - 1) {
                    const nextIndex = stretchIndex + 1;
                    setStretchIndex(nextIndex);
                    setSeconds(stretchingList[nextIndex]?.seconds || 30);
                  } else {
                    finishRoutine();
                  }
                }}
                className="flex-1 py-4 rounded-2xl bg-gray-800 hover:bg-gray-700 font-semibold transition-colors"
              >
                {stretchIndex < stretchingList.length - 1
                  ? "Siguiente →"
                  : "Terminar rutina 🎉"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ActiveRoutinePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
          <p className="text-gray-400">Cargando...</p>
        </div>
      }
    >
      <ActiveRoutineContent />
    </Suspense>
  );
}
