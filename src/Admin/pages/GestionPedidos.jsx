import PedidosHeader from "../components/gesPedidos/PedidosHeader";
import PedidosFormCard from "../components/gesPedidos/PedidosFormCard";
import PedidosTableCard from "../components/gesPedidos/PedidosTableCard";

const GestionPedidos = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex-1">
      {/* Encabezado */}
      <PedidosHeader />

      {/* Sección principal */}
      <div className="p-6 space-y-4">
        {/* Crear pedido + Lista */}
        <div className="flex flex-col lg:flex-row gap-4">
          <PedidosFormCard />
          <PedidosTableCard />
        </div>
      </div>
    </div>
  );
};

export default GestionPedidos;