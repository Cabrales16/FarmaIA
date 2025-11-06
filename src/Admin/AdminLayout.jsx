import { Outlet } from "react-router-dom";
import { useState } from "react";
import SideBar from "../Admin/components/SideBar";
import { FiMenu } from "react-icons/fi";

export default function AdminLayout() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex">
      {/* Botón hamburguesa visible solo en móvil */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-md shadow-md"
      >
        <FiMenu className="text-2xl text-blue-600" />
      </button>

      {/* Sidebar del administrador */}
      <SideBar
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Contenido principal */}
      <main
        className={`bg-gray-50 min-h-screen flex-1 transition-all duration-300 ${
          isExpanded ? "ml-64" : "ml-22"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
