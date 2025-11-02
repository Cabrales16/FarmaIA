import FormPedidos from "./FormPedidos";

const PedidosFormCard = () => {
  return (
    <div className="w-full lg:w-1/3 bg-white p-5 rounded-xl shadow-md border border-gray-200 flex flex-col h-[85vh]">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        🩺 Crear nuevo pedido
      </h2>
      <div className="flex-1 overflow-y-auto">
        <FormPedidos />
      </div>
    </div>
  );
};

export default PedidosFormCard;