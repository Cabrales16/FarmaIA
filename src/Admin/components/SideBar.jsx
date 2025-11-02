import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import toast from "react-hot-toast";
import supabase from "../../api/supabase";
import UseAuth from "../../context/UseAuth";
import { useRef } from "react";

// Íconos
import { BiHomeAlt } from "react-icons/bi";
import { LuPackage, LuUser, LuPill, LuHistory } from "react-icons/lu";

const SideBar = ({ isExpanded, setIsExpanded, mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const { setIsAuth, setUserId } = UseAuth();

  // 🔒 Cerrar sesión
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error al cerrar sesión");
      return;
    }
    setIsAuth(false);
    setUserId("");
    navigate("/home");
  };

  // 🔹 Expandir en desktop al pasar el mouse
  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) setIsExpanded(true);
  };
  const handleMouseLeave = () => {
    if (window.innerWidth >= 768) setIsExpanded(false);
  };

  return (
    <>
      {/* Fondo oscuro en móvil cuando el sidebar está abierto */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-300 text-black flex flex-col p-4 shadow-lg z-40
          transform transition-transform duration-300 ease-in-out
          ${isExpanded ? "w-64" : "w-22"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Botón cerrar visible solo en móvil */}
        <div className="flex justify-end mb-4 md:hidden">
          <button onClick={() => setMobileOpen(false)} className="text-gray-700 text-2xl">
            ✕
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="bg-blue-500 rounded-lg p-2 text-white text-2xl flex justify-center items-center w-10 h-10 flex-shrink-0">
            <LuPill />
          </div>
          {isExpanded && <span className="text-xl font-bold">FarmaIA</span>}
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-2 mb-6">
          <NavLink
            to="/inicio/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md ${
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-100"
              }`
            }
          >
            <BiHomeAlt className="text-2xl flex-shrink-0 w-6 h-6" />
            {isExpanded && <span>Dashboard</span>}
          </NavLink>

          <NavLink
            to="/inicio/pedidos"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md ${
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-100"
              }`
            }
          >
            <LuPackage className="text-2xl flex-shrink-0 w-6 h-6" />
            {isExpanded && <span>Pedidos</span>}
          </NavLink>

          <NavLink
            to="/inicio/paciente"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md ${
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-100"
              }`
            }
          >
            <LuUser className="text-2xl flex-shrink-0 w-6 h-6" />
            {isExpanded && <span>Pacientes</span>}
          </NavLink>
        </nav>

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-white text-red-600 hover:bg-gray-100"
        >
          <FiLogOut className="text-xl flex-shrink-0 w-5 h-5" />
          {isExpanded && "Cerrar sesión"}
        </button>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-300 text-xs text-center text-gray-500 mt-4">
          {isExpanded && `© ${new Date().getFullYear()} FarmaIA`}
        </div>
      </div>
    </>
  );
};

export default SideBar;