import { useEffect, useState, useMemo } from "react";
import supabase from "../../../api/supabase";
import PacienteFilters from "./PacienteFilters";
import PacienteSearchBar from "./PacienteSearchBar";

const TablePacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState({
    regimen: [],
    eps: [],
    municipio: [],
    vulnerabilidad: [],
    enfermedad: [],
  });

  // 🔹 Cargar pacientes desde Supabase
  useEffect(() => {
    const fetchPacientes = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("pacientes")
          .select(`
            id,
            nivel_vulnerabilidad,
            regimen_id,
            eps_id,
            municipio_id,
            usuario:usuario_id(nombre, documento),
            regimen:regimen_id(id, tipo),
            eps:eps_id(id, nombre),
            municipio:municipio_id(id, nombre),
            paciente_enfermedad:paciente_enfermedad(
              enfermedades_cronicas(id, nombre)
            )
          `)
          .order("id", { ascending: true });

        if (error) throw error;
        setPacientes(data || []);
      } catch (err) {
        console.error("Error al cargar pacientes:", err);
        setError("No se pudieron cargar los pacientes.");
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, []);

  // 🧮 Aplicar búsqueda y filtros locales
  const pacientesFiltrados = useMemo(() => {
    return pacientes.filter((p) => {
      const nombre = p.usuario?.nombre?.toLowerCase() || "";
      const documento = p.usuario?.documento?.toString() || "";
      const termino = busqueda.toLowerCase().trim();

      // 🔍 Coincidencia de búsqueda
      const coincideBusqueda =
        termino === "" ||
        nombre.includes(termino) ||
        documento.includes(termino);

      // 🎯 Coincidencias con los filtros
      const coincideRegimen =
        filtros.regimen.length === 0 || filtros.regimen.includes(p.regimen_id);
      const coincideEps =
        filtros.eps.length === 0 || filtros.eps.includes(p.eps_id);
      const coincideMunicipio =
        filtros.municipio.length === 0 || filtros.municipio.includes(p.municipio_id);
      const coincideVulnerabilidad =
        filtros.vulnerabilidad.length === 0 ||
        filtros.vulnerabilidad.includes(p.nivel_vulnerabilidad);

      // 🧬 Enfermedades (IDs dentro del array paciente_enfermedad)
      const enfermedadesPaciente =
        p.paciente_enfermedad?.map((e) => e.enfermedades_cronicas?.id) || [];
      const coincideEnfermedad =
        filtros.enfermedad.length === 0 ||
        enfermedadesPaciente.some((id) => filtros.enfermedad.includes(id));

      return (
        coincideBusqueda &&
        coincideRegimen &&
        coincideEps &&
        coincideMunicipio &&
        coincideVulnerabilidad &&
        coincideEnfermedad
      );
    });
  }, [pacientes, busqueda, filtros]);

  // 🔸 Mostrar estados
  if (loading)
    return (
      <div className="flex justify-center items-center h-48 text-gray-600">
        <span className="animate-pulse">Cargando pacientes...</span>
      </div>
    );

  if (error)
    return (
      <div className="p-4 bg-red-100 text-red-600 rounded-md">{error}</div>
    );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-1">
      {/* Barra superior */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 py-4 border-gray-200">
        <PacienteSearchBar busqueda={busqueda} setBusqueda={setBusqueda} />
        <PacienteFilters filtros={filtros} setFiltros={setFiltros} />
      </div>

      {/* Tabla o mensaje sin resultados */}
      <div className="overflow-x-auto overflow-y-auto max-h-[45vh] scrollbar-thin scrollbar-thumb-gray-300 border border-gray-200 rounded-xl">
        {pacientesFiltrados.length > 0 ? (
          <table className="min-w-full text-sm text-left">
            <thead className="bg-blue-600 text-white text-xs uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3">Paciente</th>
                <th className="px-6 py-3">Documento</th>
                <th className="px-6 py-3">Régimen</th>
                <th className="px-6 py-3">EPS</th>
                <th className="px-6 py-3">Municipio</th>
                <th className="px-6 py-3">Vulnerabilidad</th>
                <th className="px-6 py-3">Enfermedades</th>
              </tr>
            </thead>
            <tbody>
              {pacientesFiltrados.map((p) => (
                <tr
                  key={p.id}
                  className="border-t hover:bg-blue-50 transition duration-150"
                >
                  <td className="px-6 py-3 font-medium text-gray-800">
                    {p.usuario?.nombre || "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {p.usuario?.documento || "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {p.regimen?.tipo || "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {p.eps?.nombre || "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {p.municipio?.nombre || "—"}
                  </td>
                  <td
                    className={`px-6 py-3 font-semibold ${
                      p.nivel_vulnerabilidad === "ALTO"
                        ? "text-red-600"
                        : p.nivel_vulnerabilidad === "MEDIO"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {p.nivel_vulnerabilidad || "—"}
                  </td>
                  <td className="px-6 py-3">
                    {p.paciente_enfermedad?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {p.paciente_enfermedad.map((pe, i) => (
                          <span
                            key={i}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                          >
                            {pe.enfermedades_cronicas?.nombre}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Sin registro</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-4">No se encontraron pacientes con los filtros actuales.</p>
            <button
              onClick={() => {
                setBusqueda("");
                setFiltros({
                  regimen: [],
                  eps: [],
                  municipio: [],
                  vulnerabilidad: [],
                  enfermedad: [],
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TablePacientes;