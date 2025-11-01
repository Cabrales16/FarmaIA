import React from "react";

const estados = [
  { label: "Todos", value: "" },
  { label: "Pendiente", value: "pendiente" },
  { label: "En ruta", value: "en_ruta" },
  { label: "Entregado", value: "entregado" },
  { label: "Fallido", value: "fallido" },
];

const FiltroEstados = ({ filtro, setFiltro }) => {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="font-semibold text-gray-700">Filtrar por estado:</span>
      <select
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {estados.map((estado) => (
          <option key={estado.value} value={estado.value}>
            {estado.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FiltroEstados;