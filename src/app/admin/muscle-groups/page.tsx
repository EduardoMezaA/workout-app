'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type MuscleGroup = {
  id: string
  name: string
  slug: string
  image_url: string | null
}

export default function MuscleGroupsPage() {
  const [groups, setGroups] = useState<MuscleGroup[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const fetchGroups = async () => {
    const { data } = await supabase
      .from('muscle_groups')
      .select('*')
      .order('name')
    setGroups(data || [])
  }

  useEffect(() => { fetchGroups() }, [])

  const handleCreate = async () => {
    if (!name || !slug) {
      setError('Nombre y slug son requeridos')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase
      .from('muscle_groups')
      .insert({ name, slug })

    if (error) {
      setError(error.message)
    } else {
      setName('')
      setSlug('')
      fetchGroups()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('muscle_groups').delete().eq('id', id)
    fetchGroups()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Grupos musculares</h1>

      {/* Formulario */}
      <div className="p-6 rounded-xl border border-gray-800 mb-8">
        <h2 className="font-semibold mb-4">Agregar grupo</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Nombre</label>
            <input
              value={name}
              onChange={e => {
                setName(e.target.value)
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
              }}
              placeholder="Ej: Pecho"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Slug</label>
            <input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="Ej: pecho"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-medium transition-colors w-fit"
          >
            {loading ? 'Guardando...' : 'Agregar'}
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {groups.length === 0 && (
          <p className="text-gray-400">No hay grupos musculares todavía.</p>
        )}
        {groups.map(group => (
          <div key={group.id}
            className="flex items-center justify-between p-4 rounded-xl border border-gray-800">
            <div>
              <p className="font-medium">{group.name}</p>
              <p className="text-sm text-gray-400">{group.slug}</p>
            </div>
            <button
              onClick={() => handleDelete(group.id)}
              className="text-red-400 hover:text-red-300 text-sm transition-colors"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}