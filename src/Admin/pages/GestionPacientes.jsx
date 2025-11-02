import PacienteHeader from "../components/gesPacientes/PacienteHeader";
import PacienteFormCard from "../components/gesPacientes/PacienteFormCard";
import PacienteTableCard from "../components/gesPacientes/PacienteTableCard";
import AsignarEnfermedadesCard from "../components/gesPacientes/AsignarEnfermedadesCard"; 

const GestionPacientes = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Encabezado */}
      <PacienteHeader />

      {/* Sección principal */}
      <div className="flex-1 p-6 lg:p-6 space-y-4 overflow-hidden">
        {/* Crear paciente + Lista */}
        <div className="flex flex-col lg:flex-row gap-4 h-[60vh]">
          <div className="flex-1">
            <PacienteFormCard />
          </div>
          <div className="flex-[2]">
            <PacienteTableCard />
          </div>
        </div>

        {/* Asignar enfermedades */}
        <div className="h-[32vh] overflow-y-auto">
          <AsignarEnfermedadesCard />
        </div>
      </div>
    </div>
  );
};

export default GestionPacientes;
