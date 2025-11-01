import { Outlet } from "react-router-dom";
import { useState } from "react";
import SideBar from "../Paciente/components/SideBar";
import ChatN8n from "./components/chatn8n/ChatN8n";
import { FiMenu } from "react-icons/fi";

export default function PacienteLayout() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex">
      {/* Botón hamburguesa solo visible en móvil */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-md shadow-md"
      >
        <FiMenu className="text-2xl text-blue-600" />
      </button>

      <SideBar
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main
        className={`bg-gray-50 min-h-screen flex-1 transition-all duration-300 ${
          isExpanded ? "ml-64" : "ml-22"
        }`}
      >
        <Outlet />
      </main>

      <ChatN8n />
    </div>
  );
}