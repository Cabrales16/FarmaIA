import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UseAuth from "../context/UseAuth";
// Cada rol carga solo su propio código
const PacienteRouter = lazy(() => import("../Paciente/PacienteRouter"));
const AdminRouter = lazy(() => import("../Admin/AdminRouter"));

export default function DashboardRouter() {
  const { rol } = UseAuth();

  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Cargando...</div>}>
    <Routes>
      {rol === 1 && <Route path="/*" element={<AdminRouter />} />}
      {rol === 3 && <Route path="/*" element={<PacienteRouter />} />}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
    </Suspense>
  );
}