import { useEffect, useState, useRef } from "react";
import supabase from "../../../api/supabase";
import { FaFilter } from "react-icons/fa";
import { BiTrash } from "react-icons/bi";

const PacienteFilters = ({ filtros, setFiltros }) => {
  const [opciones, setOpciones] = useState({
    regimen: [],
    eps: [],
    municipio: [],
    vulnerabilidad: ["BAJO", "MEDIO", "ALTO"],
    enfermedad: [],
  });
  const [mostrar, setMostrar] = useState(false);
  const [posicion, setPosicion] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // 🔹 Cargar opciones de filtros desde Supabase
  useEffect(() => {
    const fetchFiltros = async () => {
      try {
        const [reg, eps, mun, enf] = await Promise.all([
          supabase.from("regimen").select("id, tipo").order("id"),
          supabase.from("eps").select("id, nombre").order("id"),
          supabase.from("municipios").select("id, nombre").order("id"),
          supabase.from("enfermedades_cronicas").select("id, nombre").order("id"),
        ]);

        setOpciones({
          regimen: reg.data || [],
          eps: eps.data || [],
          municipio: mun.data || [],
          vulnerabilidad: ["BAJO", "MEDIO", "ALTO"],
          enfermedad: enf.data || [],
        });
      } catch (error) {
        console.error("Error cargando filtros:", error);
      }
    };

    fetchFiltros();
  }, []);

  // 🔸 Cerrar menú si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setMostrar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Alternar selección de filtro
  const toggleFiltro = (tipo, valor) => {
    setFiltros((prev) => {
      const actual = new Set(prev[tipo] || []);
      const key =
        typeof valor === "number" || tipo !== "vulnerabilidad"
          ? valor
          : valor.toString();
      actual.has(key) ? actual.delete(key) : actual.add(key);
      return { ...prev, [tipo]: Array.from(actual) };
    });
  };

  // 🔹 Limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltros({
      regimen: [],
      eps: [],
      municipio: [],
      vulnerabilidad: [],
      enfermedad: [],
    });
  };

  // 🧭 Calcular posición del menú al abrir
  const toggleMenu = () => {
    if (!mostrar && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosicion({
        top: rect.bottom + window.scrollY + 8, // justo debajo del botón
        left: rect.right - 288, // alineado al lado derecho del botón (ancho 18rem)
      });
    }
    setMostrar((prev) => !prev);
  };

  const filtrosVisibles = Object.entries(opciones).filter(
    ([_, lista]) => lista?.length > 0
  );

  return (
    <>
      {/* Botón principal */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 shadow-md transition"
      >
        <FaFilter /> Filtros
      </button>

      {/* Menú de filtros (flotante y sin recorte) */}
      {mostrar && (
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            top: posicion.top,
            left: posicion.left,
            zIndex: 9999,
          }}
          className="w-72 bg-white border border-gray-200 rounded-lg shadow-2xl p-3 space-y-3 overflow-y-auto max-h-[420px] animate-fadeIn"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Filtrar por:</h3>
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 transition"
            >
              <BiTrash /> Limpiar
            </button>
          </div>

          {filtrosVisibles.map(([tipo, lista]) => (
            <div key={tipo}>
              <h3 className="text-xs font-semibold text-gray-600 mb-1 capitalize">
                {tipo}
              </h3>
              <div className="flex flex-wrap gap-1">
                {lista.map((op) => {
                  const valor = op.id || op;
                  const nombre = op.tipo || op.nombre || op;
                  const activo = filtros[tipo]?.includes(valor);

                  return (
                    <button
                      key={valor}
                      onClick={() => toggleFiltro(tipo, valor)}
                      className={`px-2 py-1 text-xs rounded-full border transition ${
                        activo
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {nombre}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default PacienteFilters;