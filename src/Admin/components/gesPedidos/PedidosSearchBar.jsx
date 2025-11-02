import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";

const PedidosSearchBar = ({ busqueda, setBusqueda }) => {
  const [tempBusqueda, setTempBusqueda] = useState(busqueda);

  // ⏳ Debounce de 400 ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setBusqueda(tempBusqueda);
    }, 400);
    return () => clearTimeout(handler);
  }, [tempBusqueda]);

  return (
    <div className="relative w-full sm:w-72">
      <input
        type="text"
        value={tempBusqueda}
        onChange={(e) => setTempBusqueda(e.target.value)}
        placeholder="Buscar pedido por paciente..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
      />
      <FaSearch className="absolute left-3 top-2.5 text-gray-500" />
    </div>
  );
};

export default PedidosSearchBar;