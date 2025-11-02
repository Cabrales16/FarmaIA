import { Routes, Route } from "react-router-dom";
import AdminLayout from "./AdminLayout";

// Páginas del administrador
import Dashboard from "./pages/Dashboard";
import GestionPacientes from "./pages/GestionPacientes";
import GestionPedidos from "./pages/GestionPedidos";

export default function AdminRouter() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Ruta por defecto: /admin → Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Páginas del administrador */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pedidos" element={<GestionPedidos />} />
        <Route path="paciente" element={<GestionPacientes />} />

        {/* Fallback: cualquier ruta no existente → Dashboard */}
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}