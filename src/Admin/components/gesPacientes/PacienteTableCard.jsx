import TablePacientes from "./TablePacientes";

const PacienteTableCard = () => {
  return (
    <div className="w-full h-full bg-white p-4 rounded-xl shadow-md border border-gray-200 flex flex-col">
      <h2 className="text-md font-semibold text-gray-700 mb-2 flex items-center gap-2">
        👥 Lista de pacientes registrados
      </h2>
      <div className="flex-1 overflow-hidden">
        <TablePacientes />
      </div>
    </div>
  );
};

export default PacienteTableCard;