import { Routes, Route, Navigate } from "react-router-dom";
import UseAuth from "../context/UseAuth";
import PacienteRouter from "../Paciente/PacienteRouter";
import AdminRouter from "../Admin/AdminRouter";

export default function DashboardRouter() {
  const { rol } = UseAuth();

  return (
    <Routes>
      {rol === 1 && <Route path="/*" element={<AdminRouter />} />}
      {rol === 3 && <Route path="/*" element={<PacienteRouter />} />}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}