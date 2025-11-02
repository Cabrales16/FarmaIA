import TablePedidos from "./TablePedidos";

const PedidosTableCard = () => {
  return (
    <div className="w-full lg:w-2/3 bg-white p-5 rounded-xl shadow-md border border-gray-200 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          📋 Lista de pedidos registrados
        </h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <TablePedidos />
      </div>
    </div>
  );
};

export default PedidosTableCard;