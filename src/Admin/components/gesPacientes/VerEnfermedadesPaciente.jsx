import { useEffect, useState } from "react";
import supabase from "../../../api/supabase";
import Select from "react-select";

const VerEnfermedadesPaciente = () => {
  const [pacientes, setPacientes] = useState([]);
  const [enfermedades, setEnfermedades] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPacientes = async () => {
      const { data } = await supabase.from("pacientes").select("id, usuario(nombre)");
      setPacientes(data || []);
    };
    loadPacientes();
  }, []);

  useEffect(() => {
    const loadEnfermedades = async () => {
      if (!pacienteSeleccionado) return;
      setLoading(true);
      const { data } = await supabase
        .from("paciente_enfermedad")
        .select("enfermedades_cronicas(nombre, clasificacion)")
        .eq("paciente_id", pacienteSeleccionado.value);
      setEnfermedades(data || []);
      setLoading(false);
    };
    loadEnfermedades();
  }, [pacienteSeleccionado]);

  const pacienteOptions = pacientes.map((p) => ({
    value: p.id,
    label: p.usuario?.nombre || `Paciente #${p.id}`,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Selecciona un paciente</label>
        <Select
          options={pacienteOptions}
          onChange={setPacienteSeleccionado}
          placeholder="Buscar paciente..."
          isClearable
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando enfermedades...</p>
      ) : pacienteSeleccionado ? (
        enfermedades.length > 0 ? (
          <table className="min-w-full border border-gray-200 rounded-lg shadow-sm text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Enfermedad</th>
                <th className="px-4 py-2 text-left font-semibold">Clasificación</th>
              </tr>
            </thead>
            <tbody>
              {enfermedades.map((e, i) => (
                <tr key={i} className="border-t hover:bg-blue-50 transition">
                  <td className="px-4 py-2">{e.enfermedades_cronicas?.nombre}</td>
                  <td className="px-4 py-2 text-gray-700">{e.enfermedades_cronicas?.clasificacion || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">Este paciente no tiene enfermedades registradas.</p>
        )
      ) : (
        <p className="text-gray-500">Selecciona un paciente para ver sus enfermedades.</p>
      )}
    </div>
  );
};

export default VerEnfermedadesPaciente;