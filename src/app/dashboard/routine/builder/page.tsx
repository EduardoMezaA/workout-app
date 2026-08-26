'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type MuscleGroup = { id: string; name: string; slug: string }

const EQUIPMENT_OPTIONS = [
  { value: 'bodyweight', label: 'Peso propio' },
  { value: 'dumbbell', label: 'Mancuernas' },
  { value: 'gym', label: 'Gym' },
]

export default function BuilderPage() {
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('muscle_groups')
      .select('*')
      .order('name')
      .then(({ data }) => setMuscleGroups(data || []))
  }, [])

  const toggleGroup = (id: string) => {
    setSelectedGroups(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  const toggleEquipment = (value: string) => {
    setSelectedEquipment(prev =>
      prev.includes(value) ? prev.filter(e => e !== value) : [...prev, value]
    )
  }

  const handleGenerate = async () => {
    if (selectedGroups.length === 0) {
      setError('Elige al menos un grupo muscular')
      return
    }
    if (selectedEquipment.length === 0) {
      setError('Elige al menos un tipo de equipamiento')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Traer ejercicios filtrados por grupo y equipamiento
      const { data: exercises, error: exError } = await supabase
        .from('exercises')
        .select('*')
        .in('muscle_group_id', selectedGroups)
        .overlaps('equipment_type', selectedEquipment)

      if (exError) throw exError
      if (!exercises || exercises.length === 0) {
        setError('No hay ejercicios disponibles para esa combinación')
        setLoading(false)
        return
      }

      // Agrupar por grupo muscular
      const grouped: Record<string, typeof exercises> = {}
      for (const ex of exercises) {
        if (!grouped[ex.muscle_group_id]) grouped[ex.muscle_group_id] = []
        grouped[ex.muscle_group_id].push(ex)
      }

      // Seleccionar hasta 3 ejercicios aleatorios por grupo
      const selected = []
      for (const groupId of selectedGroups) {
        const available = grouped[groupId] || []
        const shuffled = available.sort(() => Math.random() - 0.5)
        selected.push(...shuffled.slice(0, 3))
      }

      // Crear la rutina en Supabase
      const { data: routine, error: routineError } = await supabase
        .from('routines')
        .insert({ user_id: (await supabase.auth.getUser()).data.user?.id })
        .select()
        .single()

      if (routineError) throw routineError

      // Insertar los ejercicios de la rutina
      const routineExercises = selected.map((ex, index) => ({
        routine_id: routine.id,
        exercise_id: ex.id,
        order_index: index,
        sets_done: ex.sets_recommended,
        reps_done: ex.reps_recommended,
      }))

      const { error: reError } = await supabase
        .from('routine_exercises')
        .insert(routineExercises)

      if (reError) throw reError

      router.push(`/dashboard/routine/active?id=${routine.id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-8 py-4">
        <a href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
          ← Volver
        </a>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-1">Nueva rutina</h1>
        <p className="text-gray-400 mb-8">Elige qué grupos trabajar y con qué equipo.</p>

        {/* Grupos musculares */}
        <section className="mb-8">
          <h2 className="font-semibold mb-4">Grupos musculares</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {muscleGroups.map(group => (
              <button key={group.id}
                onClick={() => toggleGroup(group.id)}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  selectedGroups.includes(group.id)
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                <p className="font-medium">{group.name}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Equipamiento */}
        <section className="mb-10">
          <h2 className="font-semibold mb-4">Equipamiento disponible</h2>
          <div className="flex flex-wrap gap-3">
            {EQUIPMENT_OPTIONS.map(eq => (
              <button key={eq.value}
                onClick={() => toggleEquipment(eq.value)}
                className={`px-6 py-3 rounded-xl border transition-colors font-medium ${
                  selectedEquipment.includes(eq.value)
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {eq.label}
              </button>
            ))}
          </div>
        </section>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-semibold text-lg transition-colors"
        >
          {loading ? 'Generando rutina...' : 'Generar rutina'}
        </button>
      </main>
    </div>
  )
}