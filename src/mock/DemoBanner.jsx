import { useState } from "react";
import { FaFlask } from "react-icons/fa";
import { resetDemoData } from "./mockSupabase";

// Franja fija que avisa que es una demo y permite restaurar los datos de ejemplo.
export default function DemoBanner() {
  const [confirming, setConfirming] = useState(false);

  const reset = () => {
    resetDemoData();
    window.location.hash = "#/home";
    window.location.reload();
  };

  return (
    <div className="fixed bottom-0 left-0 z-[60] m-3 flex items-center gap-2 rounded-full bg-amber-100 border border-amber-300 px-3 py-1.5 text-xs text-amber-900 shadow-md">
      <FaFlask className="shrink-0" />
      <span className="hidden sm:inline">Modo demo: los datos se guardan solo en tu navegador.</span>
      <span className="sm:hidden">Modo demo</span>
      {confirming ? (
        <>
          <button onClick={reset} className="font-semibold underline">Confirmar</button>
          <button onClick={() => setConfirming(false)} className="underline">Cancelar</button>
        </>
      ) : (
        <button onClick={() => setConfirming(true)} className="font-semibold underline">
          Restaurar datos
        </button>
      )}
    </div>
  );
}
