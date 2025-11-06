import VerEnfermedadesPaciente from "./VerEnfermedadesPaciente";

const VerEnfermedadesCard = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        📋 Enfermedades asignadas por paciente
      </h2>
      <VerEnfermedadesPaciente />
    </div>
  );
};

export default VerEnfermedadesCard;