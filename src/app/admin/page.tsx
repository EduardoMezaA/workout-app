export default function AdminPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Panel de administración</h1>
      <p className="text-gray-400">Gestiona los grupos musculares y ejercicios de la app.</p>

      <div className="grid grid-cols-2 gap-4 mt-8 max-w-lg">
        <a href="/admin/muscle-groups"
          className="p-6 rounded-xl border border-gray-800 hover:border-blue-500 transition-colors">
          <h2 className="font-semibold text-lg">Grupos musculares</h2>
          <p className="text-gray-400 text-sm mt-1">Agregar y editar grupos</p>
        </a>
        <a href="/admin/exercises"
          className="p-6 rounded-xl border border-gray-800 hover:border-blue-500 transition-colors">
          <h2 className="font-semibold text-lg">Ejercicios</h2>
          <p className="text-gray-400 text-sm mt-1">Agregar y editar ejercicios</p>
        </a>
      </div>
    </div>
  )
}