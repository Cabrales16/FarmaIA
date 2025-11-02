import { useState, useRef, useEffect } from "react";
import { FaFilter } from "react-icons/fa";
import { BiTrash } from "react-icons/bi";

const PedidosFilters = ({ filtros, setFiltros }) => {
  const [mostrar, setMostrar] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const estados = ["pendiente", "en_ruta", "entregado", "fallido"];
  const prioridades = [1, 2, 3, 4, 5];

  // Cerrar el menú al hacer clic fuera
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

  const toggleFiltro = (tipo, valor) => {
    setFiltros((prev) => {
      const actual = new Set(prev[tipo] || []);
      actual.has(valor) ? actual.delete(valor) : actual.add(valor);
      return { ...prev, [tipo]: Array.from(actual) };
    });
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado: [],
      prioridad: [],
      fechaDesde: "",
      fechaHasta: "",
    });
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={() => setMostrar((prev) => !prev)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 shadow-md transition"
      >
        <FaFilter /> Filtros
      </button>

      {mostrar && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl p-3 space-y-3 overflow-y-auto max-h-[420px] z-50"
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

          {/* Estado */}
          <div>
            <h3 className="text-xs font-semibold text-gray-600 mb-1">Estado</h3>
            <div className="flex flex-wrap gap-1">
              {estados.map((estado) => (
                <button
                  key={estado}
                  onClick={() => toggleFiltro("estado", estado)}
                  className={`px-2 py-1 text-xs rounded-full border transition ${
                    filtros.estado.includes(estado)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {estado.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Prioridad */}
          <div>
            <h3 className="text-xs font-semibold text-gray-600 mb-1">
              Prioridad
            </h3>
            <div className="flex flex-wrap gap-1">
              {prioridades.map((num) => (
                <button
                  key={num}
                  onClick={() => toggleFiltro("prioridad", num)}
                  className={`px-2 py-1 text-xs rounded-full border transition ${
                    filtros.prioridad.includes(num)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div>
            <h3 className="text-xs font-semibold text-gray-600 mb-1">
              Fecha de pedido
            </h3>
            <div className="flex gap-2">
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, fechaDesde: e.target.value }))
                }
                className="w-1/2 border rounded-md text-xs px-2 py-1"
              />
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, fechaHasta: e.target.value }))
                }
                className="w-1/2 border rounded-md text-xs px-2 py-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosFilters;