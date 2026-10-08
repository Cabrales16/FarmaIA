import { useState } from "react";
import Register from "../Landing/components/home/Register";
import Login from "../Landing/components/home/Login";
import { LuPill } from "react-icons/lu";

const Home = () => {
  const [login, setLogin] = useState(true);

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-sky-100">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-10 p-6 ">
        {/* Información */}
        <div className="flex flex-col gap-4 max-w-md text-center md:text-left">
          <div className="w-16 h-16 flex items-center justify-center bg-blue-500 text-white rounded-xl shadow-lg">
            <LuPill className="text-4xl" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-800">
            FarmaIA
          </h1>
          <h2 className="text-lg text-gray-600">
            Acceso Equitativo a Medicamentos
          </h2>
          <p className="text-sm text-gray-500">
            Sistema optimizado para la entrega eficiente y transparente de
            medicamentos a pacientes con enfermedades crónicas, garantizando
            equidad en el acceso.
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>✓ Seguimiento en tiempo real</li>
            <li>✓ Rutas optimizadas con IA</li>
            <li>✓ Análisis de equidad y vulnerabilidad</li>
          </ul>
        </div>

        {/* Formulario Login/Register */}
        <div className="w-full max-w-sm">
          {login ? (
            <Login login={login} setLogin={setLogin} />
          ) : (
            <Register login={login} setLogin={setLogin} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
