import { useState } from "react";
import PedidosSearchBar from "./PedidosSearchBar";
import PedidosFilters from "./PedidosFilters";
import TablePedidos from "./TablePedidos";

const PedidosTableCard = () => {
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState({
    estado: [],
    prioridad: [],
    fechaDesde: "",
    fechaHasta: "",
  });

  return (
    <div className="w-full lg:w-2/3 bg-white p-5 rounded-xl shadow-md border border-gray-200 flex flex-col h-[85vh]">
      {/* Título */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
        📋 Lista de pedidos registrados
      </h2>

      {/* Barra superior: búsqueda + filtros */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
        <PedidosSearchBar busqueda={busqueda} setBusqueda={setBusqueda} />
        <div className="flex gap-2">
          <PedidosFilters filtros={filtros} setFiltros={setFiltros} />
        </div>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-hidden">
        <TablePedidos filtros={filtros} busqueda={busqueda} />
      </div>
    </div>
  );
};

export default PedidosTableCard;