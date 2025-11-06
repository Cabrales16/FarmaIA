import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";

// Páginas del administrador
import Dashboard from "./pages/Dashboard";
import GestionPacientes from "./pages/GestionPacientes";
import GestionPedidos from "./pages/GestionPedidos";

export default function AdminRouter() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Páginas del administrador */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pedidos" element={<GestionPedidos />} />
        <Route path="paciente" element={<GestionPacientes />} />

        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
