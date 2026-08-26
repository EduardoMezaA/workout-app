"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MuscleGroup = { id: string; name: string };
type Exercise = {
  id: string;
  name: string;
  description: string | null;
  muscle_group_id: string;
  equipment_type: string[];
  sets_recommended: number;
  reps_recommended: number;
  rest_seconds: number;
  image_url: string | null;
  gif_url: string | null;
};

const EQUIPMENT_OPTIONS = ["bodyweight", "dumbbell", "gym"];

const emptyForm = {
  name: "",
  description: "",
  muscle_group_id: "",
  equipment_type: [] as string[],
  sets_recommended: 3,
  reps_recommended: 12,
  rest_seconds: 60,
};

function FormFields({
  f,
  setF,
  muscleGroups,
  isEdit = false,
  onToggleEquipment,
}: {
  f: typeof emptyForm;
  setF: (v: any) => void;
  muscleGroups: MuscleGroup[];
  isEdit?: boolean;
  onToggleEquipment: (value: string, isEdit: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-sm text-gray-400 mb-1 block">Nombre</label>
        <input
          value={f.name}
          onChange={(e) => setF((p: any) => ({ ...p, name: e.target.value }))}
          placeholder="Ej: Press de banca"
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label className="text-sm text-gray-400 mb-1 block">Descripción</label>
        <textarea
          value={f.description}
          onChange={(e) =>
            setF((p: any) => ({ ...p, description: e.target.value }))
          }
          placeholder="Descripción del ejercicio..."
          rows={3}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>
      <div>
        <label className="text-sm text-gray-400 mb-1 block">
          Grupo muscular
        </label>
        <select
          value={f.muscle_group_id}
          onChange={(e) =>
            setF((p: any) => ({ ...p, muscle_group_id: e.target.value }))
          }
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Selecciona un grupo</option>
          {muscleGroups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Equipamiento</label>
        <div className="flex gap-3">
          {EQUIPMENT_OPTIONS.map((eq) => (
            <button
              key={eq}
              onClick={() => onToggleEquipment(eq, isEdit)}
              className={`px-4 py-1.5 rounded-lg border text-sm transition-colors ${
                f.equipment_type.includes(eq)
                  ? "border-blue-500 bg-blue-500/20 text-blue-300"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              {eq}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Series</label>
          <input
            type="number"
            value={f.sets_recommended}
            onChange={(e) =>
              setF((p: any) => ({ ...p, sets_recommended: +e.target.value }))
            }
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Reps</label>
          <input
            type="number"
            value={f.reps_recommended}
            onChange={(e) =>
              setF((p: any) => ({ ...p, reps_recommended: +e.target.value }))
            }
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">
            Descanso (seg)
          </label>
          <input
            type="number"
            value={f.rest_seconds}
            onChange={(e) =>
              setF((p: any) => ({ ...p, rest_seconds: +e.target.value }))
            }
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [gifFile, setGifFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [form, setForm] = useState(emptyForm);

  // Modal de edición
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editGifFile, setEditGifFile] = useState<File | null>(null);
  const [editFileInputKey, setEditFileInputKey] = useState(0);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const supabase = createClient();

  const fetchData = async () => {
    const [{ data: ex }, { data: mg }] = await Promise.all([
      supabase.from("exercises").select("*").order("name"),
      supabase.from("muscle_groups").select("*").order("name"),
    ]);
    setExercises(ex || []);
    setMuscleGroups(mg || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from("exercises")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabase.storage.from("exercises").getPublicUrl(data.path);
    return publicUrl;
  };

  const toggleEquipment = (value: string, isEdit = false) => {
    if (isEdit) {
      setEditForm((prev) => ({
        ...prev,
        equipment_type: prev.equipment_type.includes(value)
          ? prev.equipment_type.filter((e) => e !== value)
          : [...prev.equipment_type, value],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        equipment_type: prev.equipment_type.includes(value)
          ? prev.equipment_type.filter((e) => e !== value)
          : [...prev.equipment_type, value],
      }));
    }
  };

  const handleCreate = async () => {
    if (
      !form.name ||
      !form.muscle_group_id ||
      form.equipment_type.length === 0
    ) {
      setError("Nombre, grupo muscular y equipamiento son requeridos");
      return;
    }
    setLoading(true);
    setError("");

    try {
      let image_url = null;
      let gif_url = null;
      const timestamp = Date.now();

      if (imageFile) {
        image_url = await uploadFile(
          imageFile,
          `images/${timestamp}-${imageFile.name}`,
        );
      }
      if (gifFile) {
        gif_url = await uploadFile(
          gifFile,
          `gifs/${timestamp}-${gifFile.name}`,
        );
      }

      const { error } = await supabase.from("exercises").insert({
        ...form,
        image_url,
        gif_url,
      });

      if (error) throw error;

      setForm(emptyForm);
      setImageFile(null);
      setGifFile(null);
      setFileInputKey((prev) => prev + 1);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  const openEdit = (ex: Exercise) => {
    setEditingExercise(ex);
    setEditForm({
      name: ex.name,
      description: ex.description || "",
      muscle_group_id: ex.muscle_group_id,
      equipment_type: ex.equipment_type,
      sets_recommended: ex.sets_recommended,
      reps_recommended: ex.reps_recommended,
      rest_seconds: ex.rest_seconds,
    });
    setEditImageFile(null);
    setEditGifFile(null);
    setEditError("");
    setEditFileInputKey((prev) => prev + 1);
  };

  const handleEdit = async () => {
    if (
      !editForm.name ||
      !editForm.muscle_group_id ||
      editForm.equipment_type.length === 0
    ) {
      setEditError("Nombre, grupo muscular y equipamiento son requeridos");
      return;
    }
    setEditLoading(true);
    setEditError("");

    try {
      const timestamp = Date.now();
      let image_url = editingExercise!.image_url;
      let gif_url = editingExercise!.gif_url;

      if (editImageFile)
        image_url = await uploadFile(
          editImageFile,
          `images/${timestamp}-${editImageFile.name}`,
        );
      if (editGifFile)
        gif_url = await uploadFile(
          editGifFile,
          `gifs/${timestamp}-${editGifFile.name}`,
        );

      const { error } = await supabase
        .from("exercises")
        .update({ ...editForm, image_url, gif_url })
        .eq("id", editingExercise!.id);

      if (error) throw error;

      setEditingExercise(null);
      fetchData();
    } catch (err: any) {
      setEditError(err.message);
    }
    setEditLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("exercises").delete().eq("id", id);
    fetchData();
  };

  const groupName = (id: string) =>
    muscleGroups.find((g) => g.id === id)?.name || "-";

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Ejercicios</h1>

      {/* Formulario crear */}
      <div className="p-6 rounded-xl border border-gray-800 mb-8">
        <h2 className="font-semibold mb-4">Agregar ejercicio</h2>
        <FormFields
          f={form}
          setF={setForm}
          muscleGroups={muscleGroups}
          onToggleEquipment={toggleEquipment}
        />

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Imagen</label>
            <input
              type="file"
              accept="image/*"
              key={`image-${fileInputKey}`}
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">GIF</label>
            <input
              type="file"
              accept="image/gif"
              key={`gif-${fileInputKey}`}
              onChange={(e) => setGifFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="mt-4 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-medium transition-colors"
        >
          {loading ? "Guardando..." : "Agregar ejercicio"}
        </button>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {exercises.length === 0 && (
          <p className="text-gray-400">No hay ejercicios todavía.</p>
        )}
        {exercises.map((ex) => (
          <div
            key={ex.id}
            className="flex items-center justify-between p-4 rounded-xl border border-gray-800"
          >
            <div>
              <p className="font-medium">{ex.name}</p>
              <p className="text-sm text-gray-400">
                {groupName(ex.muscle_group_id)} · {ex.equipment_type.join(", ")}
              </p>
              <p className="text-sm text-gray-500">
                {ex.sets_recommended} series × {ex.reps_recommended} reps ·{" "}
                {ex.rest_seconds}s descanso
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => openEdit(ex)}
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(ex.id)}
                className="text-red-400 hover:text-red-300 text-sm transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal edición */}
      {editingExercise && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Editar ejercicio</h2>
              <button
                onClick={() => setEditingExercise(null)}
                className="text-gray-400 hover:text-white text-xl transition-colors"
              >
                ✕
              </button>
            </div>

            <FormFields
              f={editForm}
              setF={setEditForm}
              muscleGroups={muscleGroups}
              isEdit
              onToggleEquipment={toggleEquipment}
            />

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Imagen{" "}
                  {editingExercise.image_url && (
                    <span className="text-green-400">(tiene)</span>
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  key={`edit-image-${editFileInputKey}`}
                  onChange={(e) =>
                    setEditImageFile(e.target.files?.[0] || null)
                  }
                  className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  GIF{" "}
                  {editingExercise.gif_url && (
                    <span className="text-green-400">(tiene)</span>
                  )}
                </label>
                <input
                  type="file"
                  accept="image/gif"
                  key={`edit-gif-${editFileInputKey}`}
                  onChange={(e) => setEditGifFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                />
              </div>
            </div>

            {editError && (
              <p className="text-red-400 text-sm mt-3">{editError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleEdit}
                disabled={editLoading}
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-medium transition-colors"
              >
                {editLoading ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                onClick={() => setEditingExercise(null)}
                className="px-6 py-2 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
