import { useEffect, useState } from "react";
import Select from "react-select";
import supabase from "../../../api/supabase";
import toast from "react-hot-toast";

const AsignarEnfermedades = () => {
  const [pacientes, setPacientes] = useState([]);
  const [enfermedades, setEnfermedades] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [selectedEnfermedades, setSelectedEnfermedades] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [pacientesRes, enfermedadesRes] = await Promise.all([
        supabase.from("pacientes").select(`id, usuario:usuario_id(nombre)`),
        supabase.from("enfermedades_cronicas").select("id, nombre, clasificacion"),
      ]);

      if (pacientesRes.data) setPacientes(pacientesRes.data);
      if (enfermedadesRes.data) setEnfermedades(enfermedadesRes.data);
    };

    fetchData();
  }, []);

  const pacienteOptions = pacientes.map((p) => ({
    value: p.id,
    label: p.usuario?.nombre || `Paciente #${p.id}`,
  }));

  const enfermedadOptions = enfermedades.map((e) => ({
    value: e.id,
    label: `${e.nombre}${e.clasificacion ? ` (${e.clasificacion})` : ""}`,
  }));

  const handleAsignar = async () => {
    if (!selectedPaciente || selectedEnfermedades.length === 0) {
      toast.error("Selecciona un paciente y al menos una enfermedad.");
      return;
    }

    setLoading(true);
    try {
      const inserts = selectedEnfermedades.map((e) => ({
        paciente_id: selectedPaciente.value,
        enfermedad_id: e.value,
      }));

      const { error } = await supabase.from("paciente_enfermedad").insert(inserts);

      if (error) throw error;
      toast.success("Enfermedades asignadas correctamente.");
      setSelectedEnfermedades([]);
    } catch (err) {
      console.error(err);
      toast.error("Error al asignar enfermedades.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
        <Select options={pacienteOptions} value={selectedPaciente} onChange={setSelectedPaciente} placeholder="Selecciona un paciente..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Enfermedades</label>
        <Select isMulti options={enfermedadOptions} value={selectedEnfermedades} onChange={setSelectedEnfermedades} placeholder="Selecciona enfermedades..." />
      </div>

      <button
        onClick={handleAsignar}
        disabled={loading}
        className={`w-full py-2.5 rounded-lg text-white font-medium shadow transition ${
          loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Asignando..." : "Asignar Enfermedades"}
      </button>
    </div>
  );
};

export default AsignarEnfermedades;