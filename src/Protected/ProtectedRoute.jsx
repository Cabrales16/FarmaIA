// src/Protected/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import UseAuth from "../context/UseAuth";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuth, rol, loading } = UseAuth();
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // 🔹 Solo mostrar el spinner en el PRIMER render (inicio de sesión o carga inicial)
    // Si ya existe sesión (isAuth true o false determinado), no volver a mostrarlo.
    if (!loading) {
      const timeout = setTimeout(() => setShowLoader(false), 300); // transición corta
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // 🔹 Solo mostrar el loader la primera vez que se carga la sesión
  if (loading && showLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FaSpinner className="text-4xl text-blue-600 animate-spin" />
        <p className="mt-2 text-gray-600 font-medium">Cargando sesión...</p>
      </div>
    );
  }

  // 🔹 Si no hay sesión, redirigir al home/login
  if (!isAuth && !loading) {
    return <Navigate to="/home" replace />;
  }

  // 🔹 Si el rol no tiene acceso
  if (allowedRoles && !allowedRoles.includes(rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 🔹 Renderizar la página normalmente
  return children;
};

export default ProtectedRoute;